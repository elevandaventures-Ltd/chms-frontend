'use client';

/**
 * Step 6 — Success / Done
 *
 * Shown after the church record has been successfully created.
 * Displays a summary of the registration and links to the dashboard.
 */
import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useOnboarding, PLANS } from '@/context/OnboardingContext';

export default function Step6Done() {
  const { data } = useOnboarding();
  const plan = PLANS.find((p) => p.id === data.plan)!;

  return (
    <div className="wizard-done">
      <div className="wizard-done__icon" aria-hidden="true">
        <CheckCircle2 size={56} strokeWidth={1.5} color="var(--accent-strong)" />
      </div>

      <div className="wizard-done__copy">
        <h3 className="wizard-done__title">{data.churchName} is registered.</h3>
        <p className="wizard-done__body">
          Your church is live on the {plan.name} plan. You can now invite your
          team, manage members, and run your ministry from the dashboard.
        </p>
      </div>

      <div className="wizard-done__summary">
        <div className="wizard-done__summary-row">
          <span>Church</span>
          <strong>{data.churchName}</strong>
        </div>
        <div className="wizard-done__summary-row">
          <span>Plan</span>
          <strong>{plan.name} — {plan.price}</strong>
        </div>
        <div className="wizard-done__summary-row">
          <span>Contact</span>
          <strong>{data.contactEmail}</strong>
        </div>
        <div className="wizard-done__summary-row">
          <span>Location</span>
          <strong>{data.city}, {data.country}</strong>
        </div>
      </div>

      <div className="wizard-done__actions">
        <Link href="/">
          <Button size="lg" trailingIcon={<ArrowRight size={16} aria-hidden="true" />}>
            Go to dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
