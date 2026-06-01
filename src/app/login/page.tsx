"use client";

import { useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';

type AuthMode = 'magic' | 'password';

type FieldErrors = {
  email?: string;
  password?: string;
};

type StatusState =
  | { kind: 'idle' }
  | { kind: 'magic-sent'; email: string }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const demoPassword = 'Elevanda6!';

function isValidEmail(value: string) {
  return emailPattern.test(value.trim().toLowerCase());
}

function getAuthError(email: string) {
  const normalized = email.trim().toLowerCase();

  if (normalized.includes('missing') || normalized.endsWith('@notfound.com')) {
    return 'We could not find an account for that email address.';
  }

  return null;
}

function delay(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('magic');
  const [email, setEmail] = useState('solomon@elevanda.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<StatusState>({ kind: 'idle' });
  const [errors, setErrors] = useState<FieldErrors>({});

  const authSummary = useMemo(() => {
    if (mode === 'magic') {
      return 'Send a one-time link to your inbox and sign in without a password.';
    }

    return 'Use your email and password to continue, with a dedicated toggle for password visibility.';
  }, [mode]);

  async function handleMagicSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = email.trim();
    const nextErrors: FieldErrors = {};

    if (!isValidEmail(trimmedEmail)) {
      nextErrors.email = 'Enter a valid email address to receive the magic link.';
    }

    const accountError = nextErrors.email ? null : getAuthError(trimmedEmail);
    if (accountError) {
      nextErrors.email = accountError;
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStatus({ kind: 'error', message: nextErrors.email ?? 'Check the form and try again.' });
      return;
    }

    setErrors({});
    setLoading(true);
    setStatus({ kind: 'idle' });

    try {
      const res = await fetch('/api/auth/magic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      if (res.ok) {
        setStatus({ kind: 'magic-sent', email: trimmedEmail });
      } else {
        const body = await res.json().catch(() => ({}));
        setErrors({ email: body?.error === 'not_found' ? 'We could not find an account for that email address.' : 'Unable to send magic link. Try again.' });
        setStatus({ kind: 'error', message: body?.error ?? 'Unable to send magic link.' });
      }
    } catch (err) {
      setStatus({ kind: 'error', message: 'Network error. Try again.' });
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = email.trim();
    const nextErrors: FieldErrors = {};

    if (!isValidEmail(trimmedEmail)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    const accountError = nextErrors.email ? null : getAuthError(trimmedEmail);
    if (accountError) {
      nextErrors.email = accountError;
    }

    if (!password.trim()) {
      nextErrors.password = 'Enter your password to continue.';
    } else if (password !== demoPassword) {
      nextErrors.password = 'Wrong password. Try again or request a magic link.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStatus({ kind: 'error', message: nextErrors.password ?? nextErrors.email ?? 'Check the form and try again.' });
      return;
    }

    setErrors({});
    setLoading(true);
    setStatus({ kind: 'idle' });

    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data?.token) {
        try {
          localStorage.setItem('token', data.token);
        } catch {}

        setStatus({ kind: 'success', message: 'Signed in successfully. JWT decoded in API logs and the session is ready.' });
      } else if (res.status === 401) {
        setErrors({ password: 'Wrong password. Try again or request a magic link.' });
        setStatus({ kind: 'error', message: 'Invalid credentials.' });
      } else if (res.status === 404) {
        setErrors({ email: 'We could not find an account for that email address.' });
        setStatus({ kind: 'error', message: 'Account not found.' });
      } else {
        setStatus({ kind: 'error', message: data?.error ?? 'Unable to sign in. Try again.' });
      }
    } catch (err) {
      setStatus({ kind: 'error', message: 'Network error. Try again.' });
    } finally {
      setLoading(false);
    }
  }

  const isMagicSelected: 'true' | 'false' = mode === 'magic' ? 'true' : 'false';
  const isPasswordSelected: 'true' | 'false' = mode === 'password' ? 'true' : 'false';
  const isEmailInvalid: 'true' | 'false' = errors.email ? 'true' : 'false';
  const isPasswordInvalid: 'true' | 'false' = errors.password ? 'true' : 'false';
  const isShowingPassword: 'true' | 'false' = showPassword ? 'true' : 'false';

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <section className="auth-hero" aria-label="Login overview">
          <p className="auth-kicker">Day 6 assignment</p>
          <h1>Sign in with a magic link or your password.</h1>
          <p className="auth-intro">
            Built for a fast handoff: users can request a link, confirm a successful send, and
            fall back to email and password with explicit invalid email, account not found, and
            wrong-password states.
          </p>

          <div className="auth-metrics" aria-label="Login flow highlights">
            <article className="auth-metric">
              <span>Flow</span>
              <strong>{mode === 'magic' ? 'Magic link' : 'Password sign-in'}</strong>
            </article>
            <article className="auth-metric">
              <span>Status</span>
              <strong>
                {status.kind === 'magic-sent'
                  ? 'Link sent'
                  : status.kind === 'success'
                    ? 'Authenticated'
                    : status.kind === 'error'
                      ? 'Needs attention'
                      : 'Ready'}
              </strong>
            </article>
            <article className="auth-metric">
              <span>Copy</span>
              <strong>Email-first login</strong>
            </article>
          </div>

          <ul className="auth-notes">
            <li>Magic link confirmation replaces the form after a successful send.</li>
            <li>Password input includes a show and hide toggle for easier verification.</li>
            <li>Buttons show loading feedback while the submit action is in flight.</li>
          </ul>
        </section>

        <section className="auth-card" aria-label="Authentication form">
          <div className="auth-card__header">
            <div>
              <p className="auth-kicker">Elevanda Ventures</p>
              <h2>Access your workspace</h2>
              <p className="auth-summary">{authSummary}</p>
            </div>
          </div>

          <div className="auth-tabs" role="tablist" aria-label="Login methods">
            <button
              type="button"
              className={`auth-tab ${mode === 'magic' ? 'auth-tab--active' : ''}`}
              role="tab"
              aria-selected={isMagicSelected}
              onClick={() => {
                setMode('magic');
                setErrors({});
                setStatus({ kind: 'idle' });
              }}
            >
              Magic link
            </button>
            <button
              type="button"
              className={`auth-tab ${mode === 'password' ? 'auth-tab--active' : ''}`}
              role="tab"
              aria-selected={isPasswordSelected}
              onClick={() => {
                setMode('password');
                setErrors({});
                setStatus({ kind: 'idle' });
              }}
            >
              Email &amp; password
            </button>
          </div>

          {status.kind === 'magic-sent' ? (
            <div className="auth-banner auth-banner--success" role="status" aria-live="polite">
              <strong>Check your inbox</strong>
              <p>
                We sent a secure sign-in link to {status.email}. Use the latest email to finish
                signing in.
              </p>
            </div>
          ) : null}

          {status.kind === 'success' ? (
            <div className="auth-banner auth-banner--success" role="status" aria-live="polite">
              <strong>Signed in</strong>
              <p>{status.message}</p>
            </div>
          ) : null}

          {status.kind === 'error' ? (
            <div className="auth-banner auth-banner--error" role="alert" aria-live="polite">
              <strong>Authentication blocked</strong>
              <p>{status.message}</p>
            </div>
          ) : null}

          {mode === 'magic' ? (
            <form className="auth-form" onSubmit={handleMagicSubmit} noValidate>
              <div className={`auth-field ${errors.email ? 'auth-field--error' : ''}`}>
                <label className="auth-label" htmlFor="login-email">
                  Email address
                </label>
                <input
                  id="login-email"
                  className="auth-input"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (errors.email) {
                      setErrors((current) => ({ ...current, email: undefined }));
                    }
                  }}
                  aria-invalid={isEmailInvalid}
                  aria-describedby={errors.email ? 'login-email-error login-email-hint' : 'login-email-hint'}
                />
                <p id="login-email-hint" className="auth-hint">
                  We&apos;ll send a single-use link to this inbox.
                </p>
                {errors.email ? (
                  <p id="login-email-error" className="auth-error" role="alert">
                    {errors.email}
                  </p>
                ) : null}
              </div>

              <Button type="submit" size="lg" fullWidth loading={loading}>
                Send magic link
              </Button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handlePasswordSubmit} noValidate>
              <div className={`auth-field ${errors.email ? 'auth-field--error' : ''}`}>
                <label className="auth-label" htmlFor="password-email">
                  Email address
                </label>
                <input
                  id="password-email"
                  className="auth-input"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (errors.email) {
                      setErrors((current) => ({ ...current, email: undefined }));
                    }
                  }}
                  aria-invalid={isEmailInvalid}
                  aria-describedby={errors.email ? 'password-email-error password-email-hint' : 'password-email-hint'}
                />
                <p id="password-email-hint" className="auth-hint">
                  Use the same email associated with your workspace account.
                </p>
                {errors.email ? (
                  <p id="password-email-error" className="auth-error" role="alert">
                    {errors.email}
                  </p>
                ) : null}
              </div>

              <div className={`auth-field ${errors.password ? 'auth-field--error' : ''}`}>
                <label className="auth-label" htmlFor="login-password">
                  Password
                </label>
                <div className="auth-password">
                  <input
                    id="login-password"
                    className="auth-input auth-input--password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      if (errors.password) {
                        setErrors((current) => ({ ...current, password: undefined }));
                      }
                    }}
                    aria-invalid={isPasswordInvalid}
                    aria-describedby={errors.password ? 'login-password-error login-password-hint' : 'login-password-hint'}
                  />
                  <button
                    type="button"
                    className="auth-password__toggle"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-pressed={isShowingPassword}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <p id="login-password-hint" className="auth-hint">
                  Demo password for this flow: Elevanda6!
                </p>
                {errors.password ? (
                  <p id="login-password-error" className="auth-error" role="alert">
                    {errors.password}
                  </p>
                ) : null}
              </div>

              <Button type="submit" size="lg" fullWidth loading={loading}>
                Sign in with email
              </Button>
            </form>
          )}

          <div className="auth-card__footer">
            <p>
              Need help? The magic link flow is instant, and password sign-in surfaces the exact
              failure state for the supplied email or password.
            </p>
            <Link className="auth-footer-link" href="/signup">
              Sign up for a new workspace account
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}