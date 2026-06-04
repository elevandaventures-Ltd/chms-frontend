'use client';

/**
 * Step 5 — Review + Confirm
 *
 * Full read-only summary of all wizard data (steps 1–4) with
 * per-section edit shortcuts. Submits to POST /api/onboarding on confirm.
 */
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useOnboarding, PLANS } from '@/context/OnboardingContext';

const DENOMINATION_LABELS: Record<string, string> = {
  catholic: 'Catholic', protestant: 'Protestant', evangelical: 'Evangelical',
  pentecostal: 'Pentecostal', anglican: 'Anglican', methodist: 'Methodist',
  baptist: 'Baptist', presbyterian: 'Presbyterian', orthodox: 'Orthodox',
  adventist: 'Adventist', charismatic: 'Charismatic',
  non_denominational: 'Non-denominational', other: 'Other',
};

function ReviewSection({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="wizard-review-section">
      <div className="wizard-review-section-header">
        <p className="wizard-section-label">{title}</p>
        <button type="button" className="wizard-review-edit" onClick={onEdit}>Edit</button>
      </div>
      <div className="wizard-review-rows">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="wizard-review-row">
      <div className="wizard-review-copy">
        <span className="wizard-review-label">{label}</span>
        <span className="wizard-review-value">
          {value || <em className="wizard-review-empty">Not provided</em>}
        </span>
      </div>
    </div>
  );
}

export default function Step5Review() {
  const { data, back, next, goTo } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const denominationLabel =
    data.denomination === 'other'
      ? data.denominationOther || 'Other'
      : (DENOMINATION_LABELS[data.denomination] ?? data.denomination);

  const fullAddress = [
    data.addressLine1,
    data.addressLine2,
    data.city,
    data.state,
    data.postalCode,
    data.country,
  ].filter(Boolean).join(', ');

  const selectedPlan = PLANS.find((p) => p.id === data.plan)!;

  async function handleSubmit() {
    setLoading(true);
    setError('');

    try {
      const body = {
        churchName:    data.churchName,
        denomination:  data.denomination === 'other' ? data.denominationOther : data.denomination,
        contactName:   data.contactName,
        contactEmail:  data.contactEmail,
        contactPhone:  data.contactPhone,
        addressLine1:  data.addressLine1,
        addressLine2:  data.addressLine2,
        city:          data.city,
        state:         data.state,
        postalCode:    data.postalCode,
        country:       data.country,
        plan:          data.plan,
      };

      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json as { error?: string }).error ?? `Server error ${res.status}`);
      }

      next(); // → Step 6 done screen
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wizard-form">
      {/* Identity */}
      <ReviewSection title="Church identity" onEdit={() => goTo(1)}>
        <Row label="Church name" value={data.churchName} />
        {data.logoPreviewUrl ? (
          <div className="wizard-review-row">
            <div className="wizard-review-copy">
              <span className="wizard-review-label">Logo</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.logoPreviewUrl} alt="Church logo" className="wizard-review-logo" />
            </div>
          </div>
        ) : (
          <Row label="Logo" value="" />
        )}
      </ReviewSection>

      {/* Denomination */}
      <ReviewSection title="Denomination" onEdit={() => goTo(2)}>
        <Row label="Affiliation" value={denominationLabel} />
      </ReviewSection>

      {/* Contact & Address */}
      <ReviewSection title="Contact & address" onEdit={() => goTo(3)}>
        <Row label="Contact name" value={data.contactName} />
        <Row label="Email"        value={data.contactEmail} />
        <Row label="Phone"        value={data.contactPhone} />
        <Row label="Address"      value={fullAddress} />
      </ReviewSection>

      {/* Plan */}
      <ReviewSection title="Subscription plan" onEdit={() => goTo(4)}>
        <div className="wizard-review-row wizard-review-row--plan">
          <div className="wizard-review-copy">
            <span className="wizard-review-label">Selected plan</span>
            <span className="wizard-review-value">{selectedPlan.name}</span>
          </div>
          <span className="wizard-plan-price">{selectedPlan.price}</span>
        </div>
      </ReviewSection>

      {error && (
        <Alert variant="destructive" title="Submission failed" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <div className="wizard-nav">
        <Button type="button" variant="secondary" size="lg" onClick={back} disabled={loading}>
          Back
        </Button>
        <Button type="button" size="lg" loading={loading} onClick={handleSubmit}>
          Confirm &amp; register
        </Button>
      </div>
    </div>
  );
}
