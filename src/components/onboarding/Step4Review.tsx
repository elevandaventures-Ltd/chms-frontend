'use client';

/**
 * Step 4 — Review & Submit
 * Displays a summary of all entered data with edit shortcuts back to each step.
 * On confirm, POSTs to /api/onboarding and advances to Step 5 on success.
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useOnboarding } from '@/context/OnboardingContext';

const DENOMINATION_LABELS: Record<string, string> = {
  catholic:            'Catholic',
  protestant:          'Protestant',
  evangelical:         'Evangelical',
  pentecostal:         'Pentecostal',
  anglican:            'Anglican',
  methodist:           'Methodist',
  baptist:             'Baptist',
  presbyterian:        'Presbyterian',
  orthodox:            'Orthodox',
  adventist:           'Adventist',
  charismatic:         'Charismatic',
  non_denominational:  'Non-denominational',
  other:               'Other',
};

function ReviewRow({ label, value, onEdit }: { label: string; value: string; onEdit?: () => void }) {
  return (
    <div className="wizard-review-row">
      <div className="wizard-review-copy">
        <span className="wizard-review-label">{label}</span>
        <span className="wizard-review-value">{value || <em className="wizard-review-empty">Not provided</em>}</span>
      </div>
      {onEdit ? (
        <button type="button" className="wizard-review-edit" onClick={onEdit} aria-label={`Edit ${label}`}>
          Edit
        </button>
      ) : null}
    </div>
  );
}

export default function Step4Review() {
  const { data, back, next, goTo } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const denominationLabel = data.denomination === 'other'
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

  async function handleSubmit() {
    setLoading(true);
    setSubmitError('');

    try {
      const body = {
        churchName:         data.churchName,
        denomination:       data.denomination === 'other' ? data.denominationOther : data.denomination,
        contactName:        data.contactName,
        contactEmail:       data.contactEmail,
        contactPhone:       data.contactPhone,
        addressLine1:       data.addressLine1,
        addressLine2:       data.addressLine2,
        city:               data.city,
        state:              data.state,
        postalCode:         data.postalCode,
        country:            data.country,
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

      next(); // → Step 5 success screen
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wizard-form">
      {/* Identity */}
      <section className="wizard-review-section">
        <div className="wizard-review-section-header">
          <p className="wizard-section-label">Church identity</p>
          <button type="button" className="wizard-review-edit" onClick={() => goTo(1)}>Edit</button>
        </div>
        <div className="wizard-review-rows">
          <ReviewRow label="Church name" value={data.churchName} />
          {data.logoPreviewUrl ? (
            <div className="wizard-review-row">
              <div className="wizard-review-copy">
                <span className="wizard-review-label">Logo</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={data.logoPreviewUrl} alt="Church logo" className="wizard-review-logo" />
              </div>
            </div>
          ) : (
            <ReviewRow label="Logo" value="" />
          )}
        </div>
      </section>

      {/* Denomination */}
      <section className="wizard-review-section">
        <div className="wizard-review-section-header">
          <p className="wizard-section-label">Denomination</p>
          <button type="button" className="wizard-review-edit" onClick={() => goTo(2)}>Edit</button>
        </div>
        <div className="wizard-review-rows">
          <ReviewRow label="Affiliation" value={denominationLabel} />
        </div>
      </section>

      {/* Contact & Address */}
      <section className="wizard-review-section">
        <div className="wizard-review-section-header">
          <p className="wizard-section-label">Contact &amp; address</p>
          <button type="button" className="wizard-review-edit" onClick={() => goTo(3)}>Edit</button>
        </div>
        <div className="wizard-review-rows">
          <ReviewRow label="Contact name"  value={data.contactName} />
          <ReviewRow label="Email"         value={data.contactEmail} />
          <ReviewRow label="Phone"         value={data.contactPhone} />
          <ReviewRow label="Address"       value={fullAddress} />
        </div>
      </section>

      {submitError ? (
        <div className="auth-banner auth-banner--error" role="alert" aria-live="polite">
          <strong>Submission failed</strong>
          <p>{submitError}</p>
        </div>
      ) : null}

      {/* Navigation */}
      <div className="wizard-nav">
        <Button type="button" variant="secondary" size="lg" onClick={back} disabled={loading}>
          Back
        </Button>
        <Button type="button" size="lg" loading={loading} onClick={handleSubmit}>
          Register church
        </Button>
      </div>
    </div>
  );
}
