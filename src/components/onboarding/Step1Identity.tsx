'use client';

/**
 * Step 1 — Church Identity
 * Fields: church name (required), logo upload (optional, image preview).
 */
import React, { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { useOnboarding } from '@/context/OnboardingContext';

export default function Step1Identity() {
  const { data, patch, next } = useOnboarding();
  const [nameError, setNameError] = useState('');
  const [logoError, setLogoError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleLogoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setLogoError('Please upload a JPEG, PNG, SVG, or WebP image.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setLogoError('Image must be smaller than 2 MB.');
      return;
    }

    setLogoError('');
    const previewUrl = URL.createObjectURL(file);
    patch({ logoFile: file, logoPreviewUrl: previewUrl });
  }

  function handleRemoveLogo() {
    if (data.logoPreviewUrl) URL.revokeObjectURL(data.logoPreviewUrl);
    patch({ logoFile: null, logoPreviewUrl: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const name = data.churchName.trim();

    if (!name) {
      setNameError('Church name is required.');
      return;
    }
    if (name.length < 3) {
      setNameError('Name must be at least 3 characters.');
      return;
    }

    setNameError('');
    next();
  }

  return (
    <form className="wizard-form" onSubmit={handleSubmit} noValidate>
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
          onChange={(e) => {
            patch({ churchName: e.target.value });
            if (nameError) setNameError('');
          }}
          aria-required="true"
          aria-invalid={nameError ? 'true' : 'false'}
          aria-describedby={nameError ? 'church-name-error' : undefined}
        />
        {nameError ? (
          <p id="church-name-error" className="auth-error" role="alert">{nameError}</p>
        ) : (
          <p className="auth-hint">The official name of your church as it appears in documents.</p>
        )}
      </div>

      {/* Logo upload */}
      <div className={`auth-field ${logoError ? 'auth-field--error' : ''}`}>
        <span className="auth-label">Church logo <span className="auth-hint">(optional)</span></span>

        {data.logoPreviewUrl ? (
          <div className="wizard-logo-preview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.logoPreviewUrl} alt="Logo preview" className="wizard-logo-img" />
            <div className="wizard-logo-info">
              <p className="wizard-logo-filename">{data.logoFile?.name}</p>
              <p className="auth-hint">{data.logoFile ? `${(data.logoFile.size / 1024).toFixed(0)} KB` : ''}</p>
            </div>
            <button
              type="button"
              className="wizard-logo-remove"
              onClick={handleRemoveLogo}
              aria-label="Remove logo"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="wizard-upload-zone"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Upload church logo"
          >
            <span className="wizard-upload-icon" aria-hidden="true">🏛</span>
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

        {logoError ? (
          <p className="auth-error" role="alert">{logoError}</p>
        ) : null}
      </div>

      {/* Navigation */}
      <div className="wizard-nav">
        <span />
        <Button type="submit" size="lg">
          Continue
        </Button>
      </div>
    </form>
  );
}
