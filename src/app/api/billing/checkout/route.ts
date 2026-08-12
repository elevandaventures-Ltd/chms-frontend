/**
 * POST /api/billing/checkout — simulated Stripe test-card charge.
 *
 * IMPORTANT: this is a training/demo simulation, not a real payment
 * integration. A production build must never send a raw card number to
 * your own server — collect card details with Stripe Elements/Payment
 * Element (tokenized client-side), create a PaymentIntent, and confirm it
 * from the browser; your server only ever sees a token/PaymentIntent id,
 * and a Stripe webhook (checkout.session.completed / invoice.paid)
 * updates the subscription — never a client-submitted "it worked" flag.
 * No STRIPE_SECRET_KEY is configured in this project, so this route only
 * ever runs the local mock branch below.
 *
 * Body: { plan, cardNumber, expiry, cvc }
 * Recognizes Stripe's published test card numbers:
 *   4242 4242 4242 4242 → succeeds
 *   4000 0000 0000 0002 → declined
 *   4000 0000 0000 9995 → insufficient funds
 */
import { NextResponse, type NextRequest } from 'next/server';
import { STRIPE_TEST_CARDS, planById } from '@/lib/billing';
import { changeSubscriptionPlan, addInvoice, listInvoices } from '@/lib/superadmin-store';
import type { ChurchPlan } from '@/lib/superadmin';

const DEMO_CHURCH_ID = 'c1';

const DECLINE_MESSAGE: Record<string, string> = {
  declined: 'Your card was declined. Try a different card.',
  insufficient_funds: 'Your card has insufficient funds.',
};

export async function POST(request: NextRequest) {
  let body: { plan?: ChurchPlan; cardNumber?: string; expiry?: string; cvc?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const plan = body.plan;
  const digits = (body.cardNumber ?? '').replace(/\s+/g, '');

  if (!plan || !['community', 'growth', 'enterprise'].includes(plan)) {
    return NextResponse.json({ error: 'validation_error', message: 'Choose a plan.' }, { status: 400 });
  }
  if (!/^\d{4}$/.test(body.expiry?.replace(/\D/g, '').slice(-4) ?? '') && !body.expiry) {
    return NextResponse.json({ error: 'validation_error', message: 'Enter a valid expiry date.' }, { status: 400 });
  }
  if (!/^\d{3,4}$/.test(body.cvc ?? '')) {
    return NextResponse.json({ error: 'validation_error', message: 'Enter a valid CVC.' }, { status: 400 });
  }

  const outcome = STRIPE_TEST_CARDS[digits];
  if (!outcome) {
    return NextResponse.json(
      { error: 'card_error', message: 'Unrecognized test card. Try 4242 4242 4242 4242.' },
      { status: 402 },
    );
  }
  if (outcome !== 'success') {
    return NextResponse.json({ error: 'card_error', message: DECLINE_MESSAGE[outcome] }, { status: 402 });
  }

  const planDef = planById(plan);
  const subscription = changeSubscriptionPlan(DEMO_CHURCH_ID, plan);

  const invoiceNumber = `INV-${new Date().toISOString().slice(0, 7).replace('-', '')}-${(listInvoices(DEMO_CHURCH_ID).length + 1).toString().padStart(4, '0')}`;
  const invoice = {
    id: `inv-${Date.now().toString(36)}`,
    invoiceNumber,
    amount: planDef.price,
    currency: 'USD',
    status: 'paid' as const,
    issuedAt: new Date().toISOString(),
    paidAt: new Date().toISOString(),
  };
  addInvoice(DEMO_CHURCH_ID, invoice);

  return NextResponse.json({ data: { subscription, invoice } }, { status: 201 });
}
