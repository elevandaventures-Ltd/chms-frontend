'use client';

/**
 * Step 4 — Plan Selection
 *
 * Three plans: Community (Free), Growth ($29/mo), Enterprise ($99+/mo).
 * The Growth plan is highlighted as recommended.
 * Selection is stored in OnboardingContext and sent with the final submit.
 */
import { type FormEvent } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useOnboarding, PLANS, type PlanId } from '@/context/OnboardingContext';
import { cn } from '@/lib/utils';

export default function Step4Plan() {
  const { data, patch, next, back } = useOnboarding();

  function handleSelect(id: PlanId) {
    patch({ plan: id });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    next();
  }

  return (
    <form className="wizard-form" onSubmit={handleSubmit} noValidate>
      <div className="plan-grid">
        {PLANS.map((plan) => {
          const isSelected = data.plan === plan.id;
          return (
            <button
              key={plan.id}
              type="button"
              className={cn('plan-card', isSelected && 'plan-card--selected', plan.highlight && 'plan-card--highlight')}
              aria-pressed={isSelected}
              onClick={() => handleSelect(plan.id)}
            >
              {plan.highlight && (
                <span className="plan-card__badge">Recommended</span>
              )}

              <div className="plan-card__header">
                <h3 className="plan-card__name">{plan.name}</h3>
                <p className="plan-card__price">{plan.price}</p>
                <p className="plan-card__desc">{plan.description}</p>
              </div>

              <ul className="plan-card__features" aria-label={`${plan.name} plan features`}>
                {plan.features.map((f) => (
                  <li key={f} className="plan-card__feature">
                    <span className="plan-card__feature-icon" aria-hidden="true">
                      <Check size={13} strokeWidth={3} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <div className={cn('plan-card__select', isSelected && 'plan-card__select--active')}>
                {isSelected ? (
                  <><Check size={13} strokeWidth={3} aria-hidden="true" /> Selected</>
                ) : (
                  `Choose ${plan.name}`
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="wizard-nav">
        <Button type="button" variant="secondary" size="lg" onClick={back}>
          Back
        </Button>
        <Button type="submit" size="lg">
          Continue to review
        </Button>
      </div>
    </form>
  );
}
