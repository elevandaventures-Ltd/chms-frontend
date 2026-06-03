'use client';

/**
 * Step 5 — Success screen
 */
import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useOnboarding } from '@/context/OnboardingContext';

export default function Step5Done() {
  const { data } = useOnboarding();

  return (
    <div className="wizard-done">
      <div className="wizard-done__icon" aria-hidden="true">
        <CheckCircle2 size={56} strokeWidth={1.5} color="var(--accent-strong)" />
      </div>

      <div className="wizard-done__copy">
        <h3 className="wizard-done__title">{data.churchName} is registered.</h3>
        <p className="wizard-done__body">
          Your church profile is live. You can now invite team members, set up
          services, and manage your congregation from the workspace dashboard.
        </p>
      </div>

      <div className="wizard-done__summary">
        <div className="wizard-done__summary-row">
          <span>Church</span>
          <strong>{data.churchName}</strong>
        </div>
        <div className="wizard-done__summary-row">
          <span>Contact</span>
          <strong>{data.contactEmail}</strong>
        </div>
        <div className="wizard-done__summary-row">
          <span>City</span>
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
