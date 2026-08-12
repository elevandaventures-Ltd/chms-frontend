'use client';

/**
 * Step 1 — Church Identity + Denomination (merged)
 *
 * Combines the original Step 1 (church name + logo) and Step 2
 * (denomination selector) into a single step as requested.
 */
import React, { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  UploadCloud, X,
  Cross, Feather, BookOpen, Zap,
  Building2, Droplets, CalendarDays, Globe, Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useOnboarding } from '@/context/OnboardingContext';
import { cn } from '@/lib/utils';

// ── Denomination options ──────────────────────────────────────────────────────

const DENOMINATIONS: { value: string; label: string; icon: React.ReactNode }[] = [
  { value: 'catholic',           label: 'Catholic',           icon: <Cross        size={18} aria-hidden="true" /> },
  { value: 'protestant',         label: 'Protestant',         icon: <Feather      size={18} aria-hidden="true" /> },
  { value: 'evangelical',        label: 'Evangelical',        icon: <BookOpen     size={18} aria-hidden="true" /> },
  { value: 'pentecostal',        label: 'Pentecostal',        icon: <Zap          size={18} aria-hidden="true" /> },
  { value: 'anglican',           label: 'Anglican',           icon: <Building2    size={18} aria-hidden="true" /> },
  { value: 'methodist',          label: 'Methodist',          icon: <Feather      size={18} aria-hidden="true" /> },
  { value: 'baptist',            label: 'Baptist',            icon: <Droplets     size={18} aria-hidden="true" /> },
  { value: 'presbyterian',       label: 'Presbyterian',       icon: <Building2    size={18} aria-hidden="true" /> },
  { value: 'orthodox',           label: 'Orthodox',           icon: <Cross        size={18} aria-hidden="true" /> },
  { value: 'adventist',          label: 'Adventist',          icon: <CalendarDays size={18} aria-hidden="true" /> },
  { value: 'charismatic',        label: 'Charismatic',        icon: <Zap          size={18} aria-hidden="true" /> },
  { value: 'non_denominational', label: 'Non-denominational', icon: <Globe        size={18} aria-hidden="true" /> },
  { value: 'other',              label: 'Other',              icon: <Plus         size={18} aria-hidden="true" /> },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function Step1IdentityDenomination() {
  const { data, patch, next } = useOnboarding();

  const [nameError,  setNameError]  = useState('');
  const [denomError, setDenomError] = useState('');
  const [logoError,  setLogoError]  = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Logo handlers ─────────────────────────────────────────────────────────

  function handleLogoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setLogoError('Please upload a JPEG, PNG, SVG, or WebP image.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setLogoError('Image must be smaller than 2 MB.');
      return;
    }
    setLogoError('');
    patch({ logoFile: file, logoPreviewUrl: URL.createObjectURL(file) });
  }

  function handleRemoveLogo() {
    if (data.logoPreviewUrl) URL.revokeObjectURL(data.logoPreviewUrl);
    patch({ logoFile: null, logoPreviewUrl: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    let valid = true;

    const name = data.churchName.trim();
    if (!name) {
      setNameError('Church name is required.');
      valid = false;
    } else if (name.length < 3) {
      setNameError('Name must be at least 3 characters.');
      valid = false;
    } else {
      setNameError('');
    }

    if (!data.denomination) {
      setDenomError('Please select a denomination to continue.');
      valid = false;
    } else if (data.denomination === 'other' && !data.denominationOther.trim()) {
      setDenomError('Please describe your denomination.');
      valid = false;
    } else {
      setDenomError('');
    }

    if (valid) next();
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <form className="wizard-form" onSubmit={handleSubmit} noValidate>

      {/* ── Section: Identity ── */}
      <p className="wizard-section-label">Church identity</p>

      {/* Church name */}
      <div className={`auth-field ${nameError ? 'auth-field--error' : ''}`}>
        <label className="auth-label" htmlFor="church-name">
          Church name <span className="wizard-required" aria-hidden="true">*</span>
        </label>
        <input
          id="church-name"
          className="auth-input"
          type="text"
          autoComplete="organization"
          placeholder="e.g. Grace Community Church"
          value={data.churchName}
          maxLength={120}
          onChange={(e) => { patch({ churchName: e.target.value }); if (nameError) setNameError(''); }}
          aria-required="true"
          aria-invalid={nameError ? 'true' : 'false'}
          aria-describedby={nameError ? 'church-name-error' : 'church-name-hint'}
        />
        {nameError
          ? <p id="church-name-error" className="auth-error" role="alert">{nameError}</p>
          : <p id="church-name-hint" className="auth-hint">The official name of your church as it appears in documents.</p>
        }
      </div>

      {/* Logo upload */}
      <div className={`auth-field ${logoError ? 'auth-field--error' : ''}`}>
        <span className="auth-label">
          Church logo <span className="auth-hint">(optional)</span>
        </span>

        {data.logoPreviewUrl ? (
          <div className="wizard-logo-preview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.logoPreviewUrl} alt="Logo preview" className="wizard-logo-img" />
            <div className="wizard-logo-info">
              <p className="wizard-logo-filename">{data.logoFile?.name}</p>
              <p className="auth-hint">
                {data.logoFile ? `${(data.logoFile.size / 1024).toFixed(0)} KB` : ''}
              </p>
            </div>
            <button
              type="button"
              className="wizard-logo-remove"
              onClick={handleRemoveLogo}
              aria-label="Remove logo"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="wizard-upload-zone"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Upload church logo"
          >
            <span className="wizard-upload-icon" aria-hidden="true">
              <UploadCloud size={26} strokeWidth={1.5} />
            </span>
            <span className="wizard-upload-copy">
              <strong>Click to upload</strong>
              <span>JPEG, PNG, SVG or WebP · max 2 MB</span>
            </span>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/svg+xml,image/webp"
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
          onChange={handleLogoChange}
        />
        {logoError && <p className="auth-error" role="alert">{logoError}</p>}
      </div>

      {/* ── Section divider ── */}
      <div className="wizard-section-divider" />

      {/* ── Section: Denomination ── */}
      <p className="wizard-section-label">Denomination</p>

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
                className={cn('wizard-denom-card', isSelected && 'wizard-denom-card--selected')}
                aria-pressed={isSelected}
                onClick={() => {
                  patch({
                    denomination: d.value,
                    denominationOther: d.value !== 'other' ? '' : data.denominationOther,
                  });
                  if (denomError) setDenomError('');
                }}
              >
                <span className="wizard-denom-icon">{d.icon}</span>
                <span className="wizard-denom-label">{d.label}</span>
              </button>
            );
          })}
        </div>

        {denomError && <p className="auth-error" role="alert">{denomError}</p>}
      </fieldset>

      {/* Other denomination free-text */}
      {data.denomination === 'other' && (
        <div className={`auth-field ${denomError && !data.denominationOther.trim() ? 'auth-field--error' : ''}`}>
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
            onChange={(e) => { patch({ denominationOther: e.target.value }); if (denomError) setDenomError(''); }}
            aria-required="true"
          />
        </div>
      )}

      {/* Navigation */}
      <div className="wizard-nav">
        <span />
        <Button type="submit" size="lg">Continue</Button>
      </div>
    </form>
  );
}
