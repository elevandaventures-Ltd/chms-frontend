'use client';

/**
 * /settings/profile — User profile settings page.
 *
 * Task 2 (Day 9):
 *   - Update display name
 *   - Upload profile photo to Supabase Storage (avatars bucket)
 *   - Change password via Supabase auth.updateUser
 */
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft, UploadCloud, X, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

// ── Types ─────────────────────────────────────────────────────────────────────

type SaveStatus =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ProfileSettingsPage() {
  const [user, setUser]           = useState<User | null>(null);
  const [loadingUser, setLoading] = useState(true);

  // Profile fields
  const [displayName, setDisplayName]     = useState('');
  const [avatarFile, setAvatarFile]       = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarUrl, setAvatarUrl]         = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password fields
  const [currentPwd, setCurrentPwd]   = useState('');
  const [newPwd, setNewPwd]           = useState('');
  const [confirmPwd, setConfirmPwd]   = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);

  // Status
  const [profileStatus, setProfileStatus] = useState<SaveStatus>({ kind: 'idle' });
  const [pwdStatus, setPwdStatus]         = useState<SaveStatus>({ kind: 'idle' });
  const [pwdErrors, setPwdErrors]         = useState<{ newPwd?: string; confirmPwd?: string }>({});

  // ── Load user on mount ──────────────────────────────────────────────────────

  useEffect(() => {
    const sb = getSupabaseBrowserClient();
    if (!sb) { setLoading(false); return; }

    sb.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
        setDisplayName(user.user_metadata?.name ?? user.email ?? '');
        const url = user.user_metadata?.avatar_url ?? '';
        setAvatarUrl(url);
      }
      setLoading(false);
    });
  }, []);

  // ── Avatar upload ───────────────────────────────────────────────────────────

  function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setProfileStatus({ kind: 'error', message: 'Please upload a JPEG, PNG, or WebP image.' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setProfileStatus({ kind: 'error', message: 'Image must be smaller than 2 MB.' });
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setProfileStatus({ kind: 'idle' });
  }

  function handleRemoveAvatar() {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(null);
    setAvatarPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // ── Save profile ────────────────────────────────────────────────────────────

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    if (!displayName.trim()) {
      setProfileStatus({ kind: 'error', message: 'Display name cannot be empty.' });
      return;
    }

    const sb = getSupabaseBrowserClient();
    if (!sb) {
      setProfileStatus({ kind: 'error', message: 'Authentication is not configured.' });
      return;
    }

    setProfileStatus({ kind: 'saving' });

    try {
      let newAvatarUrl = avatarUrl;

      // Upload avatar to Supabase Storage if a new file was selected
      if (avatarFile && user) {
        const ext  = avatarFile.name.split('.').pop() ?? 'jpg';
        const path = `${user.id}/avatar.${ext}`;

        const { error: uploadError } = await sb.storage
          .from('avatars')
          .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type });

        if (uploadError) throw new Error(uploadError.message);

        const { data: urlData } = sb.storage.from('avatars').getPublicUrl(path);
        newAvatarUrl = urlData.publicUrl;
      }

      // Update user metadata
      const { error: updateError } = await sb.auth.updateUser({
        data: {
          name: displayName.trim(),
          avatar_url: newAvatarUrl,
        },
      });

      if (updateError) throw new Error(updateError.message);

      setAvatarUrl(newAvatarUrl);
      setAvatarFile(null);
      if (avatarPreview) { URL.revokeObjectURL(avatarPreview); setAvatarPreview(''); }
      setProfileStatus({ kind: 'success', message: 'Profile updated successfully.' });
    } catch (err) {
      setProfileStatus({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Failed to save profile.',
      });
    }
  }

  // ── Change password ─────────────────────────────────────────────────────────

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    const errs: typeof pwdErrors = {};
    if (newPwd.length < 8) errs.newPwd = 'New password must be at least 8 characters.';
    if (newPwd !== confirmPwd) errs.confirmPwd = 'Passwords do not match.';
    if (Object.keys(errs).length) { setPwdErrors(errs); return; }
    setPwdErrors({});

    const sb = getSupabaseBrowserClient();
    if (!sb) { setPwdStatus({ kind: 'error', message: 'Authentication is not configured.' }); return; }

    setPwdStatus({ kind: 'saving' });

    try {
      const { error } = await sb.auth.updateUser({ password: newPwd });
      if (error) throw new Error(error.message);

      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
      setPwdStatus({ kind: 'success', message: 'Password changed successfully.' });
    } catch (err) {
      setPwdStatus({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Failed to change password.',
      });
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loadingUser) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="profile-loading__bar" />
          <div className="profile-loading__bar profile-loading__bar--short" />
        </div>
      </div>
    );
  }

  const displayPreview = avatarPreview || avatarUrl;
  const initials = getInitials(displayName || user?.email || 'U');

  return (
    <div className="profile-page">
      {/* Back */}
      <Link href="/" className="signin-back" style={{ marginBottom: '24px', display: 'inline-flex' }}>
        <ArrowLeft size={14} aria-hidden="true" /> Back to dashboard
      </Link>

      <div className="profile-shell">
        {/* Left — page header */}
        <aside className="profile-hero">
          <p className="auth-kicker">Account settings</p>
          <h1 className="profile-hero__title">Your profile</h1>
          <p className="auth-intro">
            Update your display name, profile photo, and password.
            Your photo is stored in Supabase Storage.
          </p>

          {/* Avatar preview */}
          <div className="profile-avatar-preview" aria-hidden="true">
            {displayPreview ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={displayPreview} alt="" className="profile-avatar-preview__img" />
            ) : (
              <span className="profile-avatar-preview__initials">{initials}</span>
            )}
          </div>

          <div className="profile-meta">
            <strong>{displayName || 'Your name'}</strong>
            <span>{user?.email}</span>
          </div>
        </aside>

        {/* Right — forms */}
        <div className="profile-forms">

          {/* ── Profile section ── */}
          <section className="profile-card" aria-labelledby="profile-heading">
            <h2 className="profile-card__title" id="profile-heading">Profile information</h2>

            {profileStatus.kind === 'success' && (
              <Alert variant="success" onClose={() => setProfileStatus({ kind: 'idle' })}>
                {profileStatus.message}
              </Alert>
            )}
            {profileStatus.kind === 'error' && (
              <Alert variant="destructive" onClose={() => setProfileStatus({ kind: 'idle' })}>
                {profileStatus.message}
              </Alert>
            )}

            <form className="profile-form" onSubmit={handleProfileSubmit} noValidate>
              {/* Display name */}
              <div className="signin-field">
                <label className="signin-label" htmlFor="display-name">Display name</label>
                <input
                  id="display-name"
                  className="signin-input"
                  type="text"
                  autoComplete="name"
                  placeholder="Your full name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              {/* Avatar upload */}
              <div className="signin-field">
                <span className="signin-label">Profile photo</span>

                {displayPreview ? (
                  <div className="wizard-logo-preview">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={displayPreview} alt="Avatar preview" className="wizard-logo-img" />
                    <div className="wizard-logo-info">
                      <p className="wizard-logo-filename">
                        {avatarFile ? avatarFile.name : 'Current photo'}
                      </p>
                      {avatarFile && (
                        <p className="auth-hint">{(avatarFile.size / 1024).toFixed(0)} KB</p>
                      )}
                    </div>
                    {avatarFile && (
                      <button type="button" className="wizard-logo-remove" onClick={handleRemoveAvatar} aria-label="Remove photo">
                        <X size={14} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    className="wizard-upload-zone"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <span className="wizard-upload-icon" aria-hidden="true">
                      <UploadCloud size={26} strokeWidth={1.5} />
                    </span>
                    <span className="wizard-upload-copy">
                      <strong>Upload photo</strong>
                      <span>JPEG, PNG or WebP · max 2 MB</span>
                    </span>
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  aria-hidden="true"
                  tabIndex={-1}
                  onChange={handleAvatarChange}
                />
              </div>

              <div className="profile-form__actions">
                <Button
                  type="submit"
                  size="lg"
                  loading={profileStatus.kind === 'saving'}
                  leadingIcon={
                    profileStatus.kind === 'success'
                      ? <CheckCircle2 size={15} aria-hidden="true" />
                      : undefined
                  }
                >
                  Save profile
                </Button>
              </div>
            </form>
          </section>

          {/* ── Password section ── */}
          <section className="profile-card" aria-labelledby="password-heading">
            <h2 className="profile-card__title" id="password-heading">Change password</h2>

            {pwdStatus.kind === 'success' && (
              <Alert variant="success" onClose={() => setPwdStatus({ kind: 'idle' })}>
                {pwdStatus.message}
              </Alert>
            )}
            {pwdStatus.kind === 'error' && (
              <Alert variant="destructive" onClose={() => setPwdStatus({ kind: 'idle' })}>
                {pwdStatus.message}
              </Alert>
            )}

            <form className="profile-form" onSubmit={handlePasswordSubmit} noValidate>
              {/* Current password — shown for UX but Supabase doesn't require re-auth here */}
              <div className="signin-field">
                <label className="signin-label" htmlFor="current-pwd">Current password</label>
                <div className="signin-password-wrap">
                  <input
                    id="current-pwd"
                    className="signin-input signin-input--password"
                    type={showCurrent ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Your current password"
                    value={currentPwd}
                    onChange={(e) => setCurrentPwd(e.target.value)}
                  />
                  <button type="button" className="signin-toggle"
                    onClick={() => setShowCurrent((v) => !v)}
                    aria-pressed={showCurrent ? 'true' : 'false'}
                    aria-label={showCurrent ? 'Hide password' : 'Show password'}
                  >
                    {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div className={`signin-field${pwdErrors.newPwd ? ' signin-field--error' : ''}`}>
                <label className="signin-label" htmlFor="new-pwd">New password</label>
                <div className="signin-password-wrap">
                  <input
                    id="new-pwd"
                    className="signin-input signin-input--password"
                    type={showNew ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    value={newPwd}
                    onChange={(e) => { setNewPwd(e.target.value); if (pwdErrors.newPwd) setPwdErrors((p) => ({ ...p, newPwd: undefined })); }}
                    aria-invalid={pwdErrors.newPwd ? 'true' : 'false'}
                  />
                  <button type="button" className="signin-toggle"
                    onClick={() => setShowNew((v) => !v)}
                    aria-pressed={showNew ? 'true' : 'false'}
                    aria-label={showNew ? 'Hide password' : 'Show password'}
                  >
                    {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {pwdErrors.newPwd && <p className="signin-error" role="alert">{pwdErrors.newPwd}</p>}
              </div>

              {/* Confirm password */}
              <div className={`signin-field${pwdErrors.confirmPwd ? ' signin-field--error' : ''}`}>
                <label className="signin-label" htmlFor="confirm-pwd">Confirm new password</label>
                <input
                  id="confirm-pwd"
                  className="signin-input"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repeat your new password"
                  value={confirmPwd}
                  onChange={(e) => { setConfirmPwd(e.target.value); if (pwdErrors.confirmPwd) setPwdErrors((p) => ({ ...p, confirmPwd: undefined })); }}
                  aria-invalid={pwdErrors.confirmPwd ? 'true' : 'false'}
                />
                {pwdErrors.confirmPwd && <p className="signin-error" role="alert">{pwdErrors.confirmPwd}</p>}
              </div>

              <div className="profile-form__actions">
                <Button
                  type="submit"
                  size="lg"
                  loading={pwdStatus.kind === 'saving'}
                  leadingIcon={
                    pwdStatus.kind === 'success'
                      ? <CheckCircle2 size={15} aria-hidden="true" />
                      : <AlertCircle size={15} aria-hidden="true" style={{ opacity: 0.6 }} />
                  }
                >
                  Change password
                </Button>
              </div>
            </form>
          </section>

        </div>
      </div>
    </div>
  );
}
