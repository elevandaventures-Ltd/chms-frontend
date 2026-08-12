/**
 * billing.ts — Church-admin facing subscription & billing data.
 *
 * Mirrors the plan tiers introduced in the Day 9 onboarding wizard
 * (Community / Growth / Enterprise). Mock fallback follows the same
 * Supabase-then-mock convention as the rest of the platform.
 */
import type { ChurchPlan } from '@/lib/superadmin';

export type PlanDefinition = {
  id: ChurchPlan;
  name: string;
  price: number; // USD / month
  tagline: string;
  memberLimit: string;
  features: string[];
};

export const PLAN_CATALOG: PlanDefinition[] = [
  {
    id: 'community',
    name: 'Community',
    price: 0,
    tagline: 'Everything a small congregation needs to get started.',
    memberLimit: 'Up to 150 members',
    features: [
      'Member directory & households',
      'Attendance tracking (QR + kiosk)',
      'Event calendar',
      'SMS & email messaging',
      'Community support',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 49,
    tagline: 'For growing churches that need deeper insight and reach.',
    memberLimit: 'Up to 1,000 members',
    features: [
      'Everything in Community',
      'WhatsApp & push messaging',
      'Instant Meilisearch search',
      'Advanced reporting & analytics',
      'Bulk CSV import',
      'Priority email support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    tagline: 'For multi-campus churches and denominational networks.',
    memberLimit: 'Unlimited members',
    features: [
      'Everything in Growth',
      'Custom domain',
      'API access',
      'Dedicated onboarding',
      'Phone + priority support',
      'Audit log export',
    ],
  },
];

export function planById(id: ChurchPlan): PlanDefinition {
  return PLAN_CATALOG.find((p) => p.id === id) ?? PLAN_CATALOG[0];
}

export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled';

export type Subscription = {
  churchId: string;
  plan: ChurchPlan;
  status: SubscriptionStatus;
  mrr: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
};

export const mockSubscription: Subscription = {
  churchId: 'c1',
  plan: 'enterprise',
  status: 'active',
  mrr: 199,
  currentPeriodStart: new Date(Date.now() - 14 * 86_400_000).toISOString(),
  currentPeriodEnd: new Date(Date.now() + 16 * 86_400_000).toISOString(),
  cancelAtPeriodEnd: false,
};

export type InvoiceStatus = 'paid' | 'failed' | 'refunded' | 'pending';

export type Invoice = {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  issuedAt: string;
  paidAt?: string;
};

function monthsAgoDate(m: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - m);
  return d;
}

export const mockInvoices: Invoice[] = [
  { id: 'inv6', invoiceNumber: 'INV-2026-0716', amount: 199, currency: 'USD', status: 'paid',     issuedAt: monthsAgoDate(0).toISOString(), paidAt: monthsAgoDate(0).toISOString() },
  { id: 'inv5', invoiceNumber: 'INV-2026-0616', amount: 199, currency: 'USD', status: 'paid',     issuedAt: monthsAgoDate(1).toISOString(), paidAt: monthsAgoDate(1).toISOString() },
  { id: 'inv4', invoiceNumber: 'INV-2026-0516', amount: 199, currency: 'USD', status: 'failed',   issuedAt: monthsAgoDate(2).toISOString() },
  { id: 'inv3', invoiceNumber: 'INV-2026-0416', amount: 199, currency: 'USD', status: 'paid',     issuedAt: monthsAgoDate(3).toISOString(), paidAt: monthsAgoDate(3).toISOString() },
  { id: 'inv2', invoiceNumber: 'INV-2026-0316', amount: 49,  currency: 'USD', status: 'refunded', issuedAt: monthsAgoDate(4).toISOString(), paidAt: monthsAgoDate(4).toISOString() },
  { id: 'inv1', invoiceNumber: 'INV-2026-0216', amount: 49,  currency: 'USD', status: 'paid',     issuedAt: monthsAgoDate(5).toISOString(), paidAt: monthsAgoDate(5).toISOString() },
];

/** Stripe test-card numbers accepted by the mock checkout flow (Stripe's published test cards). */
export const STRIPE_TEST_CARDS: Record<string, string> = {
  '4242424242424242': 'success',
  '4000000000000002': 'declined',
  '4000000000009995': 'insufficient_funds',
};
