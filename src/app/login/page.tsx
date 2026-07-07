"use client";

import { useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Mail, Lock, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getSupabaseBrowserClient as getSupabaseClient } from '@/lib/supabase/client';

type AuthMode = 'magic' | 'password';
type FieldErrors = { email?: string; password?: string };
type StatusState =
  | { kind: 'idle' }
  | { kind: 'magic-sent'; email: string }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isValidEmail(v: string) { return emailPattern.test(v.trim().toLowerCase()); }

export default function LoginPage() {
  const [mode, setMode]            = useState<AuthMode>('magic');
  const [email, setEmail]          = useState('');
  const [password, setPassword]    = useState('');
  const [showPassword, setShowPwd] = useState(false);
  const [loading, setLoading]      = useState(false);
  const [status, setStatus]        = useState<StatusState>({ kind: 'idle' });
  const [errors, setErrors]        = useState<FieldErrors>({});

  const modeLabel = useMemo(() =>
    mode === 'magic'
      ? "We'll email you a single-use link — no password needed."
      : 'Sign in with your email and password.',
  [mode]);

  async function handleMagicSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const t = email.trim();
    const errs: FieldErrors = {};
    if (!isValidEmail(t)) errs.email = 'Enter a valid email address.';
    if (Object.keys(errs).length) { setErrors(errs); setStatus({ kind: 'error', message: errs.email ?? 'Check the form.' }); return; }
    setErrors({}); setLoading(true); setStatus({ kind: 'idle' });
    const sb = getSupabaseClient();
    if (!sb) { setStatus({ kind: 'error', message: 'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.' }); setLoading(false); return; }
    try {
      const { error } = await sb.auth.signInWithOtp({ email: t });
      if (!error) { setStatus({ kind: 'magic-sent', email: t }); }
      else { setErrors({ email: 'Unable to send magic link. Try again.' }); setStatus({ kind: 'error', message: error.message }); }
    } catch { setStatus({ kind: 'error', message: 'Network error. Try again.' }); }
    finally { setLoading(false); }
  }

  async function handlePasswordSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const t = email.trim();
    const errs: FieldErrors = {};
    if (!isValidEmail(t)) errs.email = 'Enter a valid email address.';
    if (!password.trim()) errs.password = 'Enter your password.';
    if (Object.keys(errs).length) { setErrors(errs); setStatus({ kind: 'error', message: errs.password ?? errs.email ?? 'Check the form.' }); return; }
    setErrors({}); setLoading(true); setStatus({ kind: 'idle' });
    const sb = getSupabaseClient();
    if (!sb) { setStatus({ kind: 'error', message: 'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.' }); setLoading(false); return; }
    try {
      const { data, error } = await sb.auth.signInWithPassword({ email: t, password });
      if (!error && data?.session?.access_token) {
        try { localStorage.setItem('token', data.session.access_token); } catch {}
        const next = new URLSearchParams(window.location.search).get('next') ?? '/dashboard';
        window.location.href = next;
        return;
      } else if (error) {
        if (error.status === 400 || error.status === 401) {
          setErrors({ password: 'Incorrect email or password.' });
          setStatus({ kind: 'error', message: 'Incorrect email or password.' });
        } else {
          setStatus({ kind: 'error', message: error.message ?? 'Unable to sign in. Try again.' });
        }
      } else {
        setStatus({ kind: 'error', message: 'Unable to sign in. Try again.' });
      }
    } catch { setStatus({ kind: 'error', message: 'Network error. Try again.' }); }
    finally { setLoading(false); }
  }

  return (
    <div className="signin-page">

      {/* Left panel */}
      <aside className="signin-panel" aria-hidden="true">
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
            <span className="signin-panel__name">Elevanda ChMS</span>
          </div>

          <div className="signin-panel__copy">
            <h1 className="signin-panel__headline">
              Manage your church with confidence.
            </h1>
            <p className="signin-panel__sub">
              One platform for membership, onboarding, services, and team
              coordination — built for growing congregations.
            </p>
          </div>

          <ul className="signin-panel__features" aria-label="Platform features">
            <li><span className="signin-panel__feature-dot" aria-hidden="true" />Member directory and profiles</li>
            <li><span className="signin-panel__feature-dot" aria-hidden="true" />Attendance tracking and reporting</li>
            <li><span className="signin-panel__feature-dot" aria-hidden="true" />Events, communication, and finance</li>
            <li><span className="signin-panel__feature-dot" aria-hidden="true" />Role-based access for all ministry teams</li>
          </ul>

          <div className="signin-panel__footer">
            <p>Elevanda Ventures · ChMS · {new Date().getFullYear()}</p>
          </div>
        </div>
        <div className="signin-panel__blob signin-panel__blob--1" aria-hidden="true" />
        <div className="signin-panel__blob signin-panel__blob--2" aria-hidden="true" />
      </aside>

      {/* Right panel */}
      <main className="signin-form-panel">
        <div className="signin-card" aria-label="Sign in to ChMS">

          <Link href="/" className="signin-back">
            <ArrowLeft size={14} aria-hidden="true" /> Back to dashboard
          </Link>

          <div className="signin-card__head">
            <p className="signin-eyebrow">Elevanda ChMS</p>
            <h2 className="signin-card__title">Welcome back</h2>
            <p className="signin-card__sub">{modeLabel}</p>
          </div>

          {/* Mode tabs */}
          <div className="signin-tabs" role="tablist" aria-label="Sign-in method">
            {(['magic', 'password'] as AuthMode[]).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m ? 'true' : 'false'}
                className={`signin-tab${mode === m ? ' signin-tab--active' : ''}`}
                onClick={() => { setMode(m); setErrors({}); setStatus({ kind: 'idle' }); }}
              >
                {m === 'magic'
                  ? <><Mail size={14} aria-hidden="true" /> Magic link</>
                  : <><Lock size={14} aria-hidden="true" /> Password</>}
              </button>
            ))}
          </div>

          {/* Banners */}
          {status.kind === 'magic-sent' && (
            <div className="signin-banner signin-banner--success" role="status" aria-live="polite">
              <strong><Inbox size={15} aria-hidden="true" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />Check your inbox</strong>
              <p>A sign-in link was sent to <strong>{status.email}</strong>.</p>
            </div>
          )}
          {status.kind === 'success' && (
            <div className="signin-banner signin-banner--success" role="status" aria-live="polite">
              <strong><CheckCircle2 size={15} aria-hidden="true" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />Signed in</strong>
              <p>{status.message}</p>
            </div>
          )}
          {status.kind === 'error' && (
            <div className="signin-banner signin-banner--error" role="alert" aria-live="polite">
              <strong><AlertCircle size={15} aria-hidden="true" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />Sign-in failed</strong>
              <p>{status.message}</p>
            </div>
          )}

          {/* Magic link form */}
          {mode === 'magic' && (
            <form className="signin-form" onSubmit={handleMagicSubmit} noValidate>
              <div className={`signin-field${errors.email ? ' signin-field--error' : ''}`}>
                <label className="signin-label" htmlFor="login-email">Email address</label>
                <input
                  id="login-email"
                  className="signin-input"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@church.org"
                  value={email}
                  onChange={(ev) => { setEmail(ev.target.value); if (errors.email) setErrors((p) => ({ ...p, email: undefined })); }}
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'le-err le-hint' : 'le-hint'}
                />
                <p id="le-hint" className="signin-hint">We will send a single-use sign-in link to this address.</p>
                {errors.email && <p id="le-err" className="signin-error" role="alert">{errors.email}</p>}
              </div>
              <Button type="submit" size="lg" fullWidth loading={loading}>Send magic link</Button>
            </form>
          )}

          {/* Password form */}
          {mode === 'password' && (
            <form className="signin-form" onSubmit={handlePasswordSubmit} noValidate>
              <div className={`signin-field${errors.email ? ' signin-field--error' : ''}`}>
                <label className="signin-label" htmlFor="pw-email">Email address</label>
                <input
                  id="pw-email"
                  className="signin-input"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@church.org"
                  value={email}
                  onChange={(ev) => { setEmail(ev.target.value); if (errors.email) setErrors((p) => ({ ...p, email: undefined })); }}
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'pe-err' : undefined}
                />
                {errors.email && <p id="pe-err" className="signin-error" role="alert">{errors.email}</p>}
              </div>

              <div className={`signin-field${errors.password ? ' signin-field--error' : ''}`}>
                <label className="signin-label" htmlFor="pw-password">Password</label>
                <div className="signin-password-wrap">
                  <input
                    id="pw-password"
                    className="signin-input signin-input--password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(ev) => { setPassword(ev.target.value); if (errors.password) setErrors((p) => ({ ...p, password: undefined })); }}
                    aria-invalid={errors.password ? 'true' : 'false'}
                    aria-describedby={errors.password ? 'pp-err' : undefined}
                  />
                  <button
                    type="button"
                    className="signin-toggle"
                    onClick={() => setShowPwd((v) => !v)}
                    aria-pressed={showPassword ? 'true' : 'false'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {errors.password && <p id="pp-err" className="signin-error" role="alert">{errors.password}</p>}
              </div>

              <Button type="submit" size="lg" fullWidth loading={loading}>Sign in</Button>
            </form>
          )}

          <div className="signin-card__footer">
            <p>Don&apos;t have an account?</p>
            <Link className="signin-footer-link" href="/signup">
              Create one <ArrowRight size={13} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
