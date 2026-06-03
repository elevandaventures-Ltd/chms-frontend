"use client";

import { useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { getSupabaseClient } from '@/lib/supabaseClient';

type AuthMode = 'magic' | 'password';
type FieldErrors = { email?: string; password?: string };
type StatusState =
  | { kind: 'idle' }
  | { kind: 'magic-sent'; email: string }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const demoPassword = 'Elevanda6!';

function isValidEmail(v: string) { return emailPattern.test(v.trim().toLowerCase()); }
function getAuthError(email: string) {
  const n = email.trim().toLowerCase();
  if (n.includes('missing') || n.endsWith('@notfound.com')) return 'We could not find an account for that email address.';
  return null;
}

export default function LoginPage() {
  const [mode, setMode]               = useState<AuthMode>('magic');
  const [email, setEmail]             = useState('solomon@elevanda.com');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPwd]    = useState(false);
  const [loading, setLoading]         = useState(false);
  const [status, setStatus]           = useState<StatusState>({ kind: 'idle' });
  const [errors, setErrors]           = useState<FieldErrors>({});

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
    const ae = errs.email ? null : getAuthError(t);
    if (ae) errs.email = ae;
    if (Object.keys(errs).length) { setErrors(errs); setStatus({ kind: 'error', message: errs.email ?? 'Check the form.' }); return; }
    setErrors({}); setLoading(true); setStatus({ kind: 'idle' });
    const sb = getSupabaseClient();
    if (!sb) { setStatus({ kind: 'error', message: 'Supabase env vars are missing.' }); setLoading(false); return; }
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
    const ae = errs.email ? null : getAuthError(t);
    if (ae) errs.email = ae;
    if (!password.trim()) errs.password = 'Enter your password.';
    else if (password !== demoPassword) errs.password = 'Wrong password. Try again or use a magic link.';
    if (Object.keys(errs).length) { setErrors(errs); setStatus({ kind: 'error', message: errs.password ?? errs.email ?? 'Check the form.' }); return; }
    setErrors({}); setLoading(true); setStatus({ kind: 'idle' });
    const sb = getSupabaseClient();
    if (!sb) { setStatus({ kind: 'error', message: 'Supabase env vars are missing.' }); setLoading(false); return; }
    try {
      const { data, error } = await sb.auth.signInWithPassword({ email: t, password });
      if (!error && data?.session?.access_token) {
        try { localStorage.setItem('token', data.session.access_token); } catch {}
        setStatus({ kind: 'success', message: 'Signed in successfully.' });
      } else if (error) {
        if (error.status === 401) { setErrors({ password: 'Wrong password.' }); setStatus({ kind: 'error', message: 'Invalid credentials.' }); }
        else if (error.status === 404) { setErrors({ email: 'No account for that email.' }); setStatus({ kind: 'error', message: 'Account not found.' }); }
        else { setStatus({ kind: 'error', message: error.message ?? 'Unable to sign in.' }); }
      } else { setStatus({ kind: 'error', message: 'Unable to sign in.' }); }
    } catch { setStatus({ kind: 'error', message: 'Network error. Try again.' }); }
    finally { setLoading(false); }
  }

  return (
    <div className="signin-page">

      {/* ── Left panel ────────────────────────────────────────────────── */}
      <aside className="signin-panel" aria-hidden="true">
        <div className="signin-panel__inner">
          <div className="signin-panel__brand">
            <span className="signin-panel__logo">⛪</span>
            <span className="signin-panel__name">Elevanda Ventures</span>
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
            <li>
              <span className="signin-panel__feature-dot" aria-hidden="true" />
              Church registration &amp; onboarding wizard
            </li>
            <li>
              <span className="signin-panel__feature-dot" aria-hidden="true" />
              Role-based access for admins, managers &amp; members
            </li>
            <li>
              <span className="signin-panel__feature-dot" aria-hidden="true" />
              Secure magic-link and password authentication
            </li>
            <li>
              <span className="signin-panel__feature-dot" aria-hidden="true" />
              Protected routes with Supabase session persistence
            </li>
          </ul>

          <div className="signin-panel__footer">
            <p>Elevanda Ventures · CHMS · {new Date().getFullYear()}</p>
          </div>
        </div>

        {/* decorative blobs */}
        <div className="signin-panel__blob signin-panel__blob--1" aria-hidden="true" />
        <div className="signin-panel__blob signin-panel__blob--2" aria-hidden="true" />
      </aside>

      {/* ── Right panel — form card ────────────────────────────────────── */}
      <main className="signin-form-panel">
        <div className="signin-card" aria-label="Sign in to your workspace">

          {/* Back link */}
          <Link href="/" className="signin-back">
            ← Back to dashboard
          </Link>

          {/* Header */}
          <div className="signin-card__head">
            <p className="signin-eyebrow">Elevanda Ventures</p>
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
                {m === 'magic' ? '✉ Magic link' : '🔒 Password'}
              </button>
            ))}
          </div>

          {/* Status banners */}
          {status.kind === 'magic-sent' && (
            <div className="signin-banner signin-banner--success" role="status" aria-live="polite">
              <strong>📬 Check your inbox</strong>
              <p>A sign-in link was sent to <strong>{status.email}</strong>.</p>
            </div>
          )}
          {status.kind === 'success' && (
            <div className="signin-banner signin-banner--success" role="status" aria-live="polite">
              <strong>✓ Signed in</strong>
              <p>{status.message}</p>
            </div>
          )}
          {status.kind === 'error' && (
            <div className="signin-banner signin-banner--error" role="alert" aria-live="polite">
              <strong>Sign-in failed</strong>
              <p>{status.message}</p>
            </div>
          )}

          {/* ── Magic link form ── */}
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
                <p id="le-hint" className="signin-hint">We'll send a single-use sign-in link.</p>
                {errors.email && <p id="le-err" className="signin-error" role="alert">{errors.email}</p>}
              </div>
              <Button type="submit" size="lg" fullWidth loading={loading}>Send magic link</Button>
            </form>
          )}

          {/* ── Password form ── */}
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
                <div className="signin-label-row">
                  <label className="signin-label" htmlFor="pw-password">Password</label>
                  <span className="signin-hint">Demo: Elevanda6!</span>
                </div>
                <div className="signin-password-wrap">
                  <input
                    id="pw-password"
                    className="signin-input signin-input--password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
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

          {/* Footer */}
          <div className="signin-card__footer">
            <p>Don't have an account?</p>
            <Link className="signin-footer-link" href="/signup">Create one free →</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
