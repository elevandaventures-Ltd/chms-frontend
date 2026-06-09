'use client';

/**
 * /onboarding — 5-step church registration wizard.
 *
 * Step 1 — Church details  (name + logo + denomination — merged)
 * Step 2 — Contact         (contact details + address)
 * Step 3 — Plan            (Community / Growth / Enterprise)
 * Step 4 — Review          (full summary + submit)
 * Step 5 — Done            (success)
 */
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { OnboardingProvider, useOnboarding } from '@/context/OnboardingContext';
import WizardShell                from '@/components/onboarding/WizardShell';
import Step1IdentityDenomination  from '@/components/onboarding/Step1IdentityDenomination';
import Step3Contact               from '@/components/onboarding/Step3Contact';
import Step4Plan                  from '@/components/onboarding/Step4Plan';
import Step5Review                from '@/components/onboarding/Step5Review';
import Step6Done                  from '@/components/onboarding/Step6Done';

function OnboardingInner() {
  const { step } = useOnboarding();

  return (
    <main className="onboarding-page">
      {step < 5 && (
        <Link href="/" className="onboarding-back-link">
          <ArrowLeft size={14} aria-hidden="true" /> Back to dashboard
        </Link>
      )}

      <div className="onboarding-shell">
        {/* Left — hero panel */}
        <aside className="onboarding-hero" aria-label="Registration overview">
          <p className="auth-kicker">Church registration</p>
          <h1 className="onboarding-hero__title">
            Get your church set up in minutes.
          </h1>
          <p className="auth-intro">
            Complete all 5 steps to create your church profile, choose a
            subscription plan, and start managing your congregation.
          </p>

          <ul className="auth-notes">
            <li>Step 1 — Church name, logo and denomination.</li>
            <li>Step 2 — Contact details and physical address.</li>
            <li>Step 3 — Choose your subscription plan.</li>
            <li>Step 4 — Review all information before confirming.</li>
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
            {step === 1 && <Step1IdentityDenomination />}
            {step === 2 && <Step3Contact />}
            {step === 3 && <Step4Plan />}
            {step === 4 && <Step5Review />}
            {step === 5 && <Step6Done />}
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
