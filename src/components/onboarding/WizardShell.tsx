'use client';

import { Check } from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';

const STEP_META = [
  { label: 'Identity',     description: 'Name your church and add a logo.' },
  { label: 'Denomination', description: 'Select your church affiliation.' },
  { label: 'Contact',      description: 'Add contact details and address.' },
  { label: 'Plan',         description: 'Choose the right plan for your church.' },
  { label: 'Review',       description: 'Confirm everything looks right.' },
  { label: 'Done',         description: 'Your church is registered.' },
] as const;

export default function WizardShell({ children }: { children: React.ReactNode }) {
  const { step, totalSteps, goTo } = useOnboarding();

  const progressPct = ((step - 1) / (totalSteps - 1)) * 100;
  const current = STEP_META[step - 1];

  return (
    <div className="wizard">
      <header className="wizard__header">
        <p className="wizard__eyebrow">Church registration · Step {step} of {totalSteps}</p>
        <h2 className="wizard__title">{current.label}</h2>
        <p className="wizard__desc">{current.description}</p>
      </header>

      <div
        className="wizard__progress-track"
        role="progressbar"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-label={`Step ${step} of ${totalSteps}`}
      >
        <div className="wizard__progress-fill" style={{ width: `${progressPct}%` }} />
      </div>

      <nav className="wizard__steps" aria-label="Wizard steps">
        {STEP_META.map((meta, idx) => {
          const stepNum   = (idx + 1) as 1 | 2 | 3 | 4 | 5 | 6;
          const isCompleted = stepNum < step;
          const isActive    = stepNum === step;

          return (
            <button
              key={meta.label}
              type="button"
              className={[
                'wizard__step-pill',
                isActive    ? 'wizard__step-pill--active'    : '',
                isCompleted ? 'wizard__step-pill--completed' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => isCompleted && goTo(stepNum)}
              aria-current={isActive ? 'step' : undefined}
              disabled={!isCompleted && !isActive}
              aria-label={`Step ${stepNum}: ${meta.label}${isCompleted ? ' (completed)' : ''}`}
            >
              <span className="wizard__step-num" aria-hidden="true">
                {isCompleted ? <Check size={12} strokeWidth={3} /> : stepNum}
              </span>
              <span className="wizard__step-label">{meta.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="wizard__body">{children}</div>
    </div>
  );
}
