'use client';

/**
 * /onboarding — 5-step church registration wizard.
 *
 * State is managed by OnboardingContext (React context).
 * WizardShell renders the progress bar and step pills.
 * Each step is rendered conditionally based on `step` from the context.
 */
import React from 'react';
import Link from 'next/link';
import { OnboardingProvider, useOnboarding } from '@/context/OnboardingContext';
import WizardShell from '@/components/onboarding/WizardShell';
import Step1Identity    from '@/components/onboarding/Step1Identity';
import Step2Denomination from '@/components/onboarding/Step2Denomination';
import Step3Contact     from '@/components/onboarding/Step3Contact';
import Step4Review      from '@/components/onboarding/Step4Review';
import Step5Done        from '@/components/onboarding/Step5Done';

function OnboardingInner() {
  const { step } = useOnboarding();

  return (
    <main className="onboarding-page">
      {/* Back link — only visible before completion */}
      {step < 5 ? (
        <Link href="/" className="onboarding-back-link">
          ← Back to workspace
        </Link>
      ) : null}

      <div className="onboarding-shell">
        {/* Left — hero panel */}
        <aside className="onboarding-hero" aria-label="Registration overview">
          <p className="auth-kicker">Day 8 assignment</p>
          <h1 className="onboarding-hero__title">Register your church.</h1>
          <p className="auth-intro">
            Complete the 5-step wizard to create your church profile. You can
            go back and edit any step before submitting.
          </p>

          <ul className="auth-notes">
            <li>Step 1 — Church name and logo upload.</li>
            <li>Step 2 — Denomination or affiliation.</li>
            <li>Step 3 — Contact details and physical address.</li>
            <li>Step 4 — Review all information before submitting.</li>
            <li>Step 5 — Confirmation and link to the dashboard.</li>
          </ul>

          <div className="auth-metrics">
            <article className="auth-metric">
              <span>Steps</span>
              <strong>5 total</strong>
            </article>
            <article className="auth-metric">
              <span>Current</span>
              <strong>Step {step}</strong>
            </article>
            <article className="auth-metric">
              <span>Status</span>
              <strong>{step < 5 ? 'In progress' : 'Complete'}</strong>
            </article>
          </div>
        </aside>

        {/* Right — wizard card */}
        <section className="onboarding-card" aria-label="Church registration wizard">
          <WizardShell>
            {step === 1 && <Step1Identity />}
            {step === 2 && <Step2Denomination />}
            {step === 3 && <Step3Contact />}
            {step === 4 && <Step4Review />}
            {step === 5 && <Step5Done />}
          </WizardShell>
        </section>
      </div>
    </main>
  );
}

export default function OnboardingPage() {
  return (
    <OnboardingProvider>
      <OnboardingInner />
    </OnboardingProvider>
  );
}
