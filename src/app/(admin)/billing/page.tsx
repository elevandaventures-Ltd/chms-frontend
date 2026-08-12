'use client';

/**
 * /billing — Day 42. Subscription management for church admins: current
 * plan card, upgrade/downgrade via plan comparison table, cancel-subscription
 * confirmation flow, and billing history with per-invoice download.
 */
import { useCallback, useEffect, useState } from 'react';
import { CreditCard, RotateCcw } from 'lucide-react';
import { PlanComparisonTable } from '@/components/billing/PlanComparisonTable';
import { StripeCheckoutModal } from '@/components/billing/StripeCheckoutModal';
import { CancelSubscriptionModal } from '@/components/billing/CancelSubscriptionModal';
import { BillingHistoryTable } from '@/components/billing/BillingHistoryTable';
import { planById, mockSubscription, mockInvoices, type Subscription, type Invoice, type PlanDefinition } from '@/lib/billing';
import type { ChurchPlan } from '@/lib/superadmin';

export default function BillingPage() {
  const [subscription, setSubscription] = useState<Subscription>(mockSubscription);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [loading, setLoading] = useState(true);
  const [checkoutPlan, setCheckoutPlan] = useState<PlanDefinition | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [subRes, invRes] = await Promise.all([
        fetch('/api/billing/subscription'),
        fetch('/api/billing/invoices'),
      ]);
      const subJson = await subRes.json() as { data?: Subscription };
      const invJson = await invRes.json() as { data?: Invoice[] };
      if (subJson.data) setSubscription(subJson.data);
      if (invJson.data) setInvoices(invJson.data);
    } catch {
      /* keep mock defaults */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  }

  async function handleSelectPlan(plan: ChurchPlan) {
    const def = planById(plan);
    if (def.price === 0) {
      // Downgrading to the free tier needs no charge.
      try {
        const res = await fetch('/api/billing/subscription', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan }),
        });
        const json = await res.json() as { data?: Subscription };
        if (json.data) setSubscription(json.data);
        flash(`Switched to the ${def.name} plan.`);
      } catch {
        flash('Could not switch plans. Try again.');
      }
      return;
    }
    setCheckoutPlan(def);
  }

  function handleCheckoutSuccess(result: { subscription: unknown; invoice: unknown }) {
    setSubscription(result.subscription as Subscription);
    setInvoices((prev) => [result.invoice as Invoice, ...prev]);
    flash(`Upgraded to ${checkoutPlan?.name}. Receipt added to your billing history.`);
    setCheckoutPlan(null);
  }

  async function handleCancel() {
    try {
      const res = await fetch('/api/billing/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancel: true }),
      });
      const json = await res.json() as { data?: Subscription };
      if (json.data) setSubscription(json.data);
      flash('Cancellation scheduled for the end of your billing period.');
    } finally {
      setCancelOpen(false);
    }
  }

  async function handleUndoCancel() {
    const res = await fetch('/api/billing/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cancel: false }),
    });
    const json = await res.json() as { data?: Subscription };
    if (json.data) setSubscription(json.data);
    flash('Cancellation reverted — your plan will renew as usual.');
  }

  const plan = planById(subscription.plan);
  const periodEnd = new Date(subscription.currentPeriodEnd).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="billing-page">
      {toast && <div className="comm-toast" role="status" aria-live="polite">{toast}</div>}

      <section className="current-plan-card">
        <div className="current-plan-card__icon"><CreditCard size={22} aria-hidden="true" /></div>
        <div className="current-plan-card__body">
          <span className="current-plan-card__eyebrow">Current plan</span>
          <h2 className="current-plan-card__name">
            {plan.name} {plan.price > 0 && <span>${plan.price}/mo</span>}
          </h2>
          <p className="current-plan-card__meta">
            {subscription.cancelAtPeriodEnd
              ? <>Cancels on <strong>{periodEnd}</strong> — you'll keep access until then.</>
              : <>Renews on <strong>{periodEnd}</strong></>}
          </p>
        </div>
        <div className="current-plan-card__actions">
          {subscription.cancelAtPeriodEnd ? (
            <button type="button" className="sa-btn sa-btn--secondary" onClick={handleUndoCancel}>
              <RotateCcw size={14} aria-hidden="true" />
              Undo cancellation
            </button>
          ) : plan.price > 0 ? (
            <button type="button" className="sa-btn sa-btn--danger" onClick={() => setCancelOpen(true)}>
              Cancel subscription
            </button>
          ) : null}
        </div>
      </section>

      <section className="billing-section">
        <h2 className="billing-section__title">Compare plans</h2>
        <PlanComparisonTable currentPlan={subscription.plan} onSelect={handleSelectPlan} />
      </section>

      <section className="billing-section">
        <h2 className="billing-section__title">Billing history</h2>
        {loading ? <p className="billing-history__empty">Loading…</p> : (
          <BillingHistoryTable invoices={invoices} churchName="Elevanda Chapel Accra" />
        )}
      </section>

      <StripeCheckoutModal
        open={checkoutPlan !== null}
        onClose={() => setCheckoutPlan(null)}
        plan={checkoutPlan}
        onSuccess={handleCheckoutSuccess}
      />
      <CancelSubscriptionModal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        periodEnd={subscription.currentPeriodEnd}
        onConfirm={handleCancel}
      />
    </div>
  );
}
