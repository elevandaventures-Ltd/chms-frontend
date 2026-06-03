'use client';

/**
 * Step 2 — Denomination
 * Visual card-grid selector with a free-text "Other" fallback.
 */
import React, { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { useOnboarding } from '@/context/OnboardingContext';

const DENOMINATIONS = [
  { value: 'catholic',       label: 'Catholic',          icon: '✝' },
  { value: 'protestant',     label: 'Protestant',        icon: '🕊' },
  { value: 'evangelical',    label: 'Evangelical',       icon: '📖' },
  { value: 'pentecostal',    label: 'Pentecostal',       icon: '🔥' },
  { value: 'anglican',       label: 'Anglican',          icon: '⛪' },
  { value: 'methodist',      label: 'Methodist',         icon: '✨' },
  { value: 'baptist',        label: 'Baptist',           icon: '💧' },
  { value: 'presbyterian',   label: 'Presbyterian',      icon: '🏛' },
  { value: 'orthodox',       label: 'Orthodox',          icon: '☦' },
  { value: 'adventist',      label: 'Adventist',         icon: '📅' },
  { value: 'charismatic',    label: 'Charismatic',       icon: '🙌' },
  { value: 'non_denominational', label: 'Non-denominational', icon: '🌐' },
  { value: 'other',          label: 'Other',             icon: '＋' },
] as const;

export default function Step2Denomination() {
  const { data, patch, next, back } = useOnboarding();
  const [error, setError] = useState('');

  function handleSelect(value: string) {
    patch({ denomination: value, denominationOther: value !== 'other' ? '' : data.denominationOther });
    if (error) setError('');
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!data.denomination) {
      setError('Please select a denomination to continue.');
      return;
    }
    if (data.denomination === 'other' && !data.denominationOther.trim()) {
      setError('Please describe your denomination.');
      return;
    }
    setError('');
    next();
  }

  return (
    <form className="wizard-form" onSubmit={handleSubmit} noValidate>
      <fieldset className="wizard-fieldset">
        <legend className="auth-label">
          Select your denomination <span className="wizard-required" aria-hidden="true">*</span>
        </legend>

        <div className="wizard-denom-grid" role="group" aria-label="Denomination options">
          {DENOMINATIONS.map((d) => {
            const isSelected = data.denomination === d.value;
            return (
              <button
                key={d.value}
                type="button"
                className={['wizard-denom-card', isSelected ? 'wizard-denom-card--selected' : ''].filter(Boolean).join(' ')}
                aria-pressed={isSelected}
                onClick={() => handleSelect(d.value)}
              >
                <span className="wizard-denom-icon" aria-hidden="true">{d.icon}</span>
                <span className="wizard-denom-label">{d.label}</span>
              </button>
            );
          })}
        </div>

        {error ? <p className="auth-error" role="alert">{error}</p> : null}
      </fieldset>

      {/* "Other" free-text field */}
      {data.denomination === 'other' ? (
        <div className={`auth-field ${error && !data.denominationOther.trim() ? 'auth-field--error' : ''}`}>
          <label className="auth-label" htmlFor="denomination-other">
            Describe your denomination <span className="wizard-required" aria-hidden="true">*</span>
          </label>
          <input
            id="denomination-other"
            className="auth-input"
            type="text"
            placeholder="e.g. Independent Reformed"
            value={data.denominationOther}
            maxLength={100}
            onChange={(e) => {
              patch({ denominationOther: e.target.value });
              if (error) setError('');
            }}
            aria-required="true"
          />
        </div>
      ) : null}

      {/* Navigation */}
      <div className="wizard-nav">
        <Button type="button" variant="secondary" size="lg" onClick={back}>
          Back
        </Button>
        <Button type="submit" size="lg">
          Continue
        </Button>
      </div>
    </form>
  );
}
