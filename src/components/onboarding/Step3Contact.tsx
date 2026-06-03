'use client';

/**
 * Step 3 — Contact details + address
 * Fields: contact name, email, phone, address line 1 & 2, city, state, postal code, country.
 */
import React, { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { useOnboarding } from '@/context/OnboardingContext';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+\d\s\-().]{7,20}$/;

type FieldErrors = Partial<Record<
  'contactName' | 'contactEmail' | 'contactPhone' | 'addressLine1' | 'city' | 'state' | 'postalCode' | 'country',
  string
>>;

const COUNTRIES = [
  'Ghana', 'Nigeria', 'Kenya', 'South Africa', 'United States', 'United Kingdom',
  'Canada', 'Australia', 'Germany', 'France', 'Other',
];

export default function Step3Contact() {
  const { data, patch, next, back } = useOnboarding();
  const [errors, setErrors] = useState<FieldErrors>({});

  function validate(): FieldErrors {
    const e: FieldErrors = {};
    if (!data.contactName.trim())                        e.contactName  = 'Contact name is required.';
    if (!emailPattern.test(data.contactEmail.trim()))    e.contactEmail = 'Enter a valid email address.';
    if (data.contactPhone && !phonePattern.test(data.contactPhone)) e.contactPhone = 'Enter a valid phone number.';
    if (!data.addressLine1.trim())                       e.addressLine1 = 'Street address is required.';
    if (!data.city.trim())                               e.city         = 'City is required.';
    if (!data.state.trim())                              e.state        = 'State / region is required.';
    if (!data.postalCode.trim())                         e.postalCode   = 'Postal code is required.';
    if (!data.country.trim())                            e.country      = 'Country is required.';
    return e;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    next();
  }

  function field(key: keyof FieldErrors, label: string, inputProps: React.InputHTMLAttributes<HTMLInputElement>) {
    const error = errors[key];
    return (
      <div className={`auth-field ${error ? 'auth-field--error' : ''}`}>
        <label className="auth-label" htmlFor={`onb-${key}`}>
          {label}{inputProps.required ? <span className="wizard-required" aria-hidden="true"> *</span> : null}
        </label>
        <input
          id={`onb-${key}`}
          className="auth-input"
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `onb-${key}-error` : undefined}
          {...inputProps}
          onChange={(ev) => {
            inputProps.onChange?.(ev);
            if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
          }}
        />
        {error ? <p id={`onb-${key}-error`} className="auth-error" role="alert">{error}</p> : null}
      </div>
    );
  }

  return (
    <form className="wizard-form" onSubmit={handleSubmit} noValidate>
      <p className="wizard-section-label">Primary contact</p>

      {field('contactName', 'Full name', {
        type: 'text',
        autoComplete: 'name',
        placeholder: 'Pastor / Administrator name',
        required: true,
        value: data.contactName,
        onChange: (e) => patch({ contactName: e.target.value }),
      })}

      <div className="wizard-two-col">
        {field('contactEmail', 'Email address', {
          type: 'email',
          autoComplete: 'email',
          inputMode: 'email',
          placeholder: 'church@example.com',
          required: true,
          value: data.contactEmail,
          onChange: (e) => patch({ contactEmail: e.target.value }),
        })}
        {field('contactPhone', 'Phone number', {
          type: 'tel',
          autoComplete: 'tel',
          inputMode: 'tel',
          placeholder: '+233 20 000 0000',
          value: data.contactPhone,
          onChange: (e) => patch({ contactPhone: e.target.value }),
        })}
      </div>

      <p className="wizard-section-label">Church address</p>

      {field('addressLine1', 'Street address', {
        type: 'text',
        autoComplete: 'address-line1',
        placeholder: '14 Worship Road',
        required: true,
        value: data.addressLine1,
        onChange: (e) => patch({ addressLine1: e.target.value }),
      })}

      <div className="auth-field">
        <label className="auth-label" htmlFor="onb-addressLine2">Address line 2</label>
        <input
          id="onb-addressLine2"
          className="auth-input"
          type="text"
          autoComplete="address-line2"
          placeholder="Suite, floor, P.O. Box (optional)"
          value={data.addressLine2}
          onChange={(e) => patch({ addressLine2: e.target.value })}
        />
      </div>

      <div className="wizard-two-col">
        {field('city', 'City', {
          type: 'text',
          autoComplete: 'address-level2',
          placeholder: 'Accra',
          required: true,
          value: data.city,
          onChange: (e) => patch({ city: e.target.value }),
        })}
        {field('state', 'State / Region', {
          type: 'text',
          autoComplete: 'address-level1',
          placeholder: 'Greater Accra',
          required: true,
          value: data.state,
          onChange: (e) => patch({ state: e.target.value }),
        })}
      </div>

      <div className="wizard-two-col">
        {field('postalCode', 'Postal code', {
          type: 'text',
          autoComplete: 'postal-code',
          inputMode: 'numeric',
          placeholder: 'GA-123-4567',
          required: true,
          value: data.postalCode,
          onChange: (e) => patch({ postalCode: e.target.value }),
        })}

        {/* Country select — not using the generic field() helper because it's a <select> */}
        <div className={`auth-field ${errors.country ? 'auth-field--error' : ''}`}>
          <label className="auth-label" htmlFor="onb-country">
            Country <span className="wizard-required" aria-hidden="true">*</span>
          </label>
          <div className="auth-select-wrap">
            <select
              id="onb-country"
              className="auth-input auth-select"
              value={data.country}
              onChange={(e) => {
                patch({ country: e.target.value });
                if (errors.country) setErrors((prev) => ({ ...prev, country: undefined }));
              }}
              aria-invalid={errors.country ? 'true' : 'false'}
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <span className="auth-select-chevron" aria-hidden="true">▾</span>
          </div>
          {errors.country ? <p className="auth-error" role="alert">{errors.country}</p> : null}
        </div>
      </div>

      {/* Navigation */}
      <div className="wizard-nav">
        <Button type="button" variant="secondary" size="lg" onClick={back}>
          Back
        </Button>
        <Button type="submit" size="lg">
          Review
        </Button>
      </div>
    </form>
  );
}
