'use client';

/**
 * StripeCheckoutModal — Day 42.
 *
 * Card-entry step for a paid plan change. This is a *simulated* Stripe
 * test-card flow for the review checklist ("Test Stripe payment flow with
 * Stripe test card") — see /api/billing/checkout for why no real card
 * data ever reaches a real payment processor here.
 */
import { useState } from 'react';
import { CreditCard, Lock } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { PlanDefinition } from '@/lib/billing';

type Props = {
  open: boolean;
  onClose: () => void;
  plan: PlanDefinition | null;
  onSuccess: (result: { subscription: unknown; invoice: unknown }) => void;
};

const TEST_CARDS = [
  { number: '4242 4242 4242 4242', label: 'Always succeeds' },
  { number: '4000 0000 0000 0002', label: 'Always declined' },
  { number: '4000 0000 0000 9995', label: 'Insufficient funds' },
];

export function StripeCheckoutModal({ open, onClose, plan, onSuccess }: Props) {
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('123');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!plan) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: plan!.id, cardNumber, expiry, cvc }),
      });
      const json = await res.json() as { data?: { subscription: unknown; invoice: unknown }; message?: string };
      if (!res.ok || !json.data) throw new Error(json.message ?? 'Payment failed.');
      onSuccess(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Upgrade to ${plan.name}`}>
      <form className="sc-form" onSubmit={submit}>
        <p className="sc-form__summary">
          <strong>${plan.price}/mo</strong> — {plan.tagline}
        </p>

        <div className="sc-form__field">
          <label htmlFor="sc-card">Card number</label>
          <div className="sc-form__input-icon">
            <CreditCard size={14} aria-hidden="true" />
            <input
              id="sc-card"
              inputMode="numeric"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="4242 4242 4242 4242"
              required
            />
          </div>
        </div>

        <div className="sc-form__row">
          <div className="sc-form__field">
            <label htmlFor="sc-expiry">Expiry</label>
            <input id="sc-expiry" value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM/YY" required />
          </div>
          <div className="sc-form__field">
            <label htmlFor="sc-cvc">CVC</label>
            <input id="sc-cvc" inputMode="numeric" value={cvc} onChange={(e) => setCvc(e.target.value)} placeholder="123" required />
          </div>
        </div>

        <div className="sc-form__test-cards">
          <span>Stripe test cards:</span>
          <ul>
            {TEST_CARDS.map((c) => (
              <li key={c.number}>
                <button type="button" onClick={() => setCardNumber(c.number)}>{c.number}</button>
                <span>{c.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {error && <p className="sc-form__error">{error}</p>}

        <button type="submit" className="sa-btn sa-btn--primary sc-form__submit" disabled={busy}>
          <Lock size={13} aria-hidden="true" />
          {busy ? 'Processing…' : `Pay $${plan.price} and upgrade`}
        </button>
      </form>
    </Modal>
  );
}

export default StripeCheckoutModal;
