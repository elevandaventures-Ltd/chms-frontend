"use client";

import { useState, type FormEvent } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { getSupabaseClient } from '@/lib/supabaseClient';

type SignupErrors = {
  name?: string;
  email?: string;
  password?: string;
};

type SignupStatus =
  | { kind: 'idle' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(value: string) {
  return emailPattern.test(value.trim().toLowerCase());
}

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<SignupErrors>({});
  const [status, setStatus] = useState<SignupStatus>({ kind: 'idle' });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: SignupErrors = {};

    if (!name.trim()) nextErrors.name = 'Enter your name.';
    if (!isValidEmail(email)) nextErrors.email = 'Enter a valid email address.';
    if (password.length < 8) nextErrors.password = 'Use at least 8 characters.';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStatus({ kind: 'error', message: 'Check the fields and try again.' });
      return;
    }

    setErrors({});
    setLoading(true);
    setStatus({ kind: 'idle' });

    const supabase = getSupabaseClient();
    if (!supabase) {
      setStatus({ kind: 'error', message: 'Supabase env vars are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.' });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });

      if (!error) {
        try {
          if (data?.session?.access_token) {
            localStorage.setItem('token', data.session.access_token);
          }
        } catch {}

        setStatus({ kind: 'success', message: 'Account created successfully. Check your email if confirmation is required.' });
      } else {
        if (error.message?.includes('already')) {
          setErrors({ email: 'An account already exists for that email.' });
          setStatus({ kind: 'error', message: 'Account already exists.' });
        } else {
          setStatus({ kind: 'error', message: error.message ?? 'Unable to create account.' });
        }
      }
    } catch {
      setStatus({ kind: 'error', message: 'Network error. Try again.' });
    } finally {
      setLoading(false);
    }
  }

  const isNameInvalid: 'true' | 'false' = errors.name ? 'true' : 'false';
  const isEmailInvalid: 'true' | 'false' = errors.email ? 'true' : 'false';
  const isPasswordInvalid: 'true' | 'false' = errors.password ? 'true' : 'false';

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <section className="auth-hero" aria-label="Signup overview">
          <p className="auth-kicker">Create an account</p>
          <h1>Set up a new workspace account.</h1>
          <p className="auth-intro">
            Sign up here to create a new account for the mock auth flow, receive a JWT, and then
            log in with the same email and password.
          </p>
          <ul className="auth-notes">
            <li>Creates an in-memory user during the current dev session.</li>
            <li>Returns a mock JWT and stores it locally after success.</li>
            <li>Use the Login page after sign up to test the sign-in path.</li>
          </ul>
        </section>

        <section className="auth-card" aria-label="Signup form">
          <div className="auth-card__header">
            <div>
              <p className="auth-kicker">Elevanda Ventures</p>
              <h2>Sign up</h2>
              <p className="auth-summary">Create a new account to test the auth flow.</p>
            </div>
          </div>

          {status.kind === 'success' ? (
            <div className="auth-banner auth-banner--success" role="status" aria-live="polite">
              <strong>Account created</strong>
              <p>{status.message}</p>
            </div>
          ) : null}

          {status.kind === 'error' ? (
            <div className="auth-banner auth-banner--error" role="alert" aria-live="polite">
              <strong>Signup blocked</strong>
              <p>{status.message}</p>
            </div>
          ) : null}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className={`auth-field ${errors.name ? 'auth-field--error' : ''}`}>
              <label className="auth-label" htmlFor="signup-name">Full name</label>
              <input
                id="signup-name"
                className="auth-input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                aria-invalid={isNameInvalid}
                aria-describedby={errors.name ? 'signup-name-error' : undefined}
                placeholder="Your name"
              />
              {errors.name ? <p id="signup-name-error" className="auth-error">{errors.name}</p> : null}
            </div>

            <div className={`auth-field ${errors.email ? 'auth-field--error' : ''}`}>
              <label className="auth-label" htmlFor="signup-email">Email address</label>
              <input
                id="signup-email"
                className="auth-input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={isEmailInvalid}
                aria-describedby={errors.email ? 'signup-email-error' : undefined}
                placeholder="name@company.com"
              />
              {errors.email ? <p id="signup-email-error" className="auth-error">{errors.email}</p> : null}
            </div>

            <div className={`auth-field ${errors.password ? 'auth-field--error' : ''}`}>
              <label className="auth-label" htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                className="auth-input"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={isPasswordInvalid}
                aria-describedby={errors.password ? 'signup-password-error' : undefined}
                placeholder="At least 8 characters"
              />
              {errors.password ? <p id="signup-password-error" className="auth-error">{errors.password}</p> : null}
            </div>

            <Button type="submit" size="lg" fullWidth loading={loading}>Create account</Button>
          </form>

          <div className="auth-card__footer">
            <p>
              Already have an account? <Link className="auth-footer-link" href="/login">Log in</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
