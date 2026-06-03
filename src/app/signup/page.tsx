"use client";

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getSupabaseClient } from '@/lib/supabaseClient';

type SignupErrors  = { name?: string; email?: string; password?: string };
type SignupStatus  = { kind: 'idle' } | { kind: 'success'; message: string } | { kind: 'error'; message: string };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isValidEmail(v: string) { return emailPattern.test(v.trim().toLowerCase()); }

export default function SignupPage() {
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState<SignupErrors>({});
  const [status,   setStatus]   = useState<SignupStatus>({ kind: 'idle' });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs: SignupErrors = {};
    if (!name.trim())          errs.name     = 'Enter your full name.';
    if (!isValidEmail(email))  errs.email    = 'Enter a valid email address.';
    if (password.length < 8)   errs.password = 'Use at least 8 characters.';
    if (Object.keys(errs).length) { setErrors(errs); setStatus({ kind: 'error', message: 'Check the fields and try again.' }); return; }
    setErrors({}); setLoading(true); setStatus({ kind: 'idle' });
    const sb = getSupabaseClient();
    if (!sb) { setStatus({ kind: 'error', message: 'Supabase env vars are missing.' }); setLoading(false); return; }
    try {
      const { data, error } = await sb.auth.signUp({ email, password, options: { data: { name } } });
      if (!error) {
        try { if (data?.session?.access_token) localStorage.setItem('token', data.session.access_token); } catch {}
        setStatus({ kind: 'success', message: 'Account created! Check your email if confirmation is required.' });
      } else {
        if (error.message?.includes('already')) { setErrors({ email: 'An account already exists for that email.' }); setStatus({ kind: 'error', message: 'Account already exists.' }); }
        else { setStatus({ kind: 'error', message: error.message ?? 'Unable to create account.' }); }
      }
    } catch { setStatus({ kind: 'error', message: 'Network error. Try again.' }); }
    finally { setLoading(false); }
  }

  const pwStrength = password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : 3;
  const pwLabel    = ['', 'Too short', 'Good', 'Strong'][pwStrength];
  const pwColor    = ['', '#b91c1c', '#9a6000', '#16a34a'][pwStrength];

  return (
    <div className="signin-page">

      {/* Left panel */}
      <aside className="signin-panel signin-panel--green" aria-hidden="true">
        <div className="signin-panel__inner">
          <div className="signin-panel__brand">
            <span className="signin-panel__logo" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 22V10l9-8 9 8v12"/>
                <path d="M9 22V16h6v6"/>
                <path d="M12 2v4"/>
                <path d="M10 6h4"/>
              </svg>
            </span>
            <span className="signin-panel__name">Elevanda Ventures</span>
          </div>

          <div className="signin-panel__copy">
            <h1 className="signin-panel__headline">
              Your church deserves great tools.
            </h1>
            <p className="signin-panel__sub">
              Create your free account and start registering your church, managing
              members, and tracking your ministry from a single workspace.
            </p>
          </div>

          <ul className="signin-panel__features" aria-label="Getting started steps">
            <li><span className="signin-panel__feature-dot" aria-hidden="true" />Create your account in under a minute</li>
            <li><span className="signin-panel__feature-dot" aria-hidden="true" />Run the 5-step church onboarding wizard</li>
            <li><span className="signin-panel__feature-dot" aria-hidden="true" />Invite your team and assign roles</li>
            <li><span className="signin-panel__feature-dot" aria-hidden="true" />Manage services, members &amp; reports</li>
          </ul>

          <div className="signin-panel__footer">
            <p>Elevanda Ventures · CHMS · {new Date().getFullYear()}</p>
          </div>
        </div>
        <div className="signin-panel__blob signin-panel__blob--1" aria-hidden="true" />
        <div className="signin-panel__blob signin-panel__blob--2" aria-hidden="true" />
      </aside>

      {/* Right panel */}
      <main className="signin-form-panel">
        <div className="signin-card" aria-label="Create your account">

          <Link href="/login" className="signin-back">
            <ArrowLeft size={14} aria-hidden="true" /> Back to sign in
          </Link>

          <div className="signin-card__head">
            <p className="signin-eyebrow">Elevanda Ventures</p>
            <h2 className="signin-card__title">Create your account</h2>
            <p className="signin-card__sub">Free to start. No credit card needed.</p>
          </div>

          {status.kind === 'success' && (
            <div className="signin-banner signin-banner--success" role="status" aria-live="polite">
              <strong>
                <CheckCircle2 size={15} aria-hidden="true" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                Account created
              </strong>
              <p>{status.message}</p>
              <Link className="signin-footer-link" href="/login" style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                Sign in now <ArrowRight size={13} aria-hidden="true" />
              </Link>
            </div>
          )}
          {status.kind === 'error' && (
            <div className="signin-banner signin-banner--error" role="alert" aria-live="polite">
              <strong>
                <AlertCircle size={15} aria-hidden="true" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                Signup failed
              </strong>
              <p>{status.message}</p>
            </div>
          )}

          <form className="signin-form" onSubmit={handleSubmit} noValidate>

            <div className={`signin-field${errors.name ? ' signin-field--error' : ''}`}>
              <label className="signin-label" htmlFor="su-name">Full name</label>
              <input id="su-name" className="signin-input" type="text" autoComplete="name"
                placeholder="Pastor John Doe" value={name}
                onChange={(ev) => { setName(ev.target.value); if (errors.name) setErrors((p) => ({ ...p, name: undefined })); }}
                aria-invalid={errors.name ? 'true' : 'false'} aria-describedby={errors.name ? 'su-name-err' : undefined}
              />
              {errors.name && <p id="su-name-err" className="signin-error" role="alert">{errors.name}</p>}
            </div>

            <div className={`signin-field${errors.email ? ' signin-field--error' : ''}`}>
              <label className="signin-label" htmlFor="su-email">Email address</label>
              <input id="su-email" className="signin-input" type="email" autoComplete="email" inputMode="email"
                placeholder="you@church.org" value={email}
                onChange={(ev) => { setEmail(ev.target.value); if (errors.email) setErrors((p) => ({ ...p, email: undefined })); }}
                aria-invalid={errors.email ? 'true' : 'false'} aria-describedby={errors.email ? 'su-email-err' : undefined}
              />
              {errors.email && <p id="su-email-err" className="signin-error" role="alert">{errors.email}</p>}
            </div>

            <div className={`signin-field${errors.password ? ' signin-field--error' : ''}`}>
              <label className="signin-label" htmlFor="su-password">Password</label>
              <div className="signin-password-wrap">
                <input id="su-password" className="signin-input signin-input--password"
                  type={showPwd ? 'text' : 'password'} autoComplete="new-password"
                  placeholder="At least 8 characters" value={password}
                  onChange={(ev) => { setPassword(ev.target.value); if (errors.password) setErrors((p) => ({ ...p, password: undefined })); }}
                  aria-invalid={errors.password ? 'true' : 'false'} aria-describedby={errors.password ? 'su-pw-err' : undefined}
                />
                <button type="button" className="signin-toggle"
                  onClick={() => setShowPwd((v) => !v)}
                  aria-pressed={showPwd ? 'true' : 'false'}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? 'Hide' : 'Show'}
                </button>
              </div>
              {password.length > 0 && (
                <div className="signin-strength">
                  <div className="signin-strength__track">
                    <div className="signin-strength__fill" style={{ width: `${(pwStrength / 3) * 100}%`, background: pwColor }} />
                  </div>
                  <span className="signin-strength__label" style={{ color: pwColor }}>{pwLabel}</span>
                </div>
              )}
              {errors.password && <p id="su-pw-err" className="signin-error" role="alert">{errors.password}</p>}
            </div>

            <Button type="submit" size="lg" fullWidth loading={loading}>Create account</Button>

            <p className="signin-terms">
              By creating an account you agree to our{' '}
              <span style={{ color: 'var(--accent-strong)', fontWeight: 600 }}>Terms of Service</span>{' '}
              and{' '}
              <span style={{ color: 'var(--accent-strong)', fontWeight: 600 }}>Privacy Policy</span>.
            </p>
          </form>

          <div className="signin-card__footer">
            <p>Already have an account?</p>
            <Link className="signin-footer-link" href="/login">
              Sign in <ArrowRight size={13} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
