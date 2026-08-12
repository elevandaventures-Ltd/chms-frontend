'use client';

/**
 * PlanComparisonTable — Day 42. Community / Growth / Enterprise side by
 * side, with an upgrade/downgrade button per column.
 */
import { Check } from 'lucide-react';
import { PLAN_CATALOG } from '@/lib/billing';
import type { ChurchPlan } from '@/lib/superadmin';

type Props = {
  currentPlan: ChurchPlan;
  onSelect: (plan: ChurchPlan) => void;
  busyPlan?: ChurchPlan | null;
};

export function PlanComparisonTable({ currentPlan, onSelect, busyPlan }: Props) {
  return (
    <div className="plan-grid">
      {PLAN_CATALOG.map((plan) => {
        const isCurrent = plan.id === currentPlan;
        return (
          <div key={plan.id} className={`plan-card${isCurrent ? ' plan-card--current' : ''}`}>
            {isCurrent && <span className="plan-card__badge">Current plan</span>}
            <h3 className="plan-card__name">{plan.name}</h3>
            <p className="plan-card__price">
              {plan.price === 0 ? 'Free' : <>${plan.price}<span>/mo</span></>}
            </p>
            <p className="plan-card__tagline">{plan.tagline}</p>
            <p className="plan-card__limit">{plan.memberLimit}</p>
            <ul className="plan-card__features">
              {plan.features.map((f) => (
                <li key={f}><Check size={13} aria-hidden="true" />{f}</li>
              ))}
            </ul>
            <button
              type="button"
              className={isCurrent ? 'sa-btn sa-btn--secondary' : 'sa-btn sa-btn--primary'}
              onClick={() => onSelect(plan.id)}
              disabled={isCurrent || busyPlan === plan.id}
            >
              {isCurrent
                ? 'Current plan'
                : busyPlan === plan.id
                  ? 'Working…'
                  : PLAN_CATALOG.findIndex((p) => p.id === plan.id) > PLAN_CATALOG.findIndex((p) => p.id === currentPlan)
                    ? 'Upgrade'
                    : 'Downgrade'}
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default PlanComparisonTable;
