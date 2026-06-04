'use client';

/**
 * /onboarding — 6-step church registration wizard.
 *
 * Step 1 — Identity      (church name + logo)
 * Step 2 — Denomination  (affiliation)
 * Step 3 — Contact       (contact details + address)
 * Step 4 — Plan          (Community / Growth / Enterprise)
 * Step 5 — Review        (full summary + submit)
 * Step 6 — Done          (success)
 */
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { OnboardingProvider, useOnboarding } from '@/context/OnboardingContext';
import WizardShell      from '@/components/onboarding/WizardShell';
import Step1Identity    from '@/components/onboarding/Step1Identity';
import Step2Denomination from '@/components/onboarding/Step2Denomination';
import Step3Contact     from '@/components/onboarding/Step3Contact';
import Step4Plan        from '@/components/onboarding/Step4Plan';
import Step5Review      from '@/components/onboarding/Step5Review';
import Step6Done        from '@/components/onboarding/Step6Done';

function OnboardingInner() {
  const { step } = useOnboarding();

  return (
    <main className="onboarding-page">
      {step < 6 && (
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
            Complete all 6 steps to create your church profile, choose a
            subscription plan, and start managing your congregation.
          </p>

          <ul className="auth-notes">
            <li>Step 1 — Church name and logo upload.</li>
            <li>Step 2 — Denomination or affiliation.</li>
            <li>Step 3 — Contact details and physical address.</li>
            <li>Step 4 — Choose your subscription plan.</li>
            <li>Step 5 — Review all information before confirming.</li>
            <li>Step 6 — Confirmation and link to the dashboard.</li>
          </ul>

          <div className="auth-metrics">
            <article className="auth-metric">
              <span>Steps</span>
              <strong>6 total</strong>
            </article>
            <article className="auth-metric">
              <span>Current</span>
              <strong>Step {step}</strong>
            </article>
            <article className="auth-metric">
              <span>Status</span>
              <strong>{step < 6 ? 'In progress' : 'Complete'}</strong>
            </article>
          </div>
        </aside>

        {/* Right — wizard card */}
        <section className="onboarding-card" aria-label="Church registration wizard">
          <WizardShell>
            {step === 1 && <Step1Identity />}
            {step === 2 && <Step2Denomination />}
            {step === 3 && <Step3Contact />}
            {step === 4 && <Step4Plan />}
            {step === 5 && <Step5Review />}
            {step === 6 && <Step6Done />}
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
