'use client';

import { useEffect, useRef, useState } from 'react';
import { X, AlertTriangle, ArrowRight } from 'lucide-react';
import {
  MEMBER_STATUSES,
  DESTRUCTIVE_STATUSES,
  type MemberStatusValue,
} from '@/lib/member-schema';
import type { Member } from '@/lib/site';

// ── Status presentation ─────────────────────────────────────────────────────

const STATUS_META: Record<MemberStatusValue, { label: string; cls: string; blurb: string }> = {
  active:   { label: 'Active',   cls: 'msm-pill--active',   blurb: 'Full member — appears on rosters and receives communications.' },
  inactive: { label: 'Inactive', cls: 'msm-pill--inactive', blurb: 'Removed from active rosters and bulk communications.' },
  visitor:  { label: 'Visitor',  cls: 'msm-pill--visitor',  blurb: 'First-time or occasional attendee being followed up.' },
};

function isDestructive(target: MemberStatusValue): boolean {
  return DESTRUCTIVE_STATUSES.includes(target);
}

// ── Props ─────────────────────────────────────────────────────────────────────

type MemberStatusModalProps = {
  member:   Member;
  onClose:  () => void;
  onChanged: (status: MemberStatusValue) => void;
};

// ── Component ─────────────────────────────────────────────────────────────────

export function MemberStatusModal({ member, onClose, onChanged }: MemberStatusModalProps) {
  const current = member.status as MemberStatusValue;
  const allowedNext = MEMBER_STATUSES.filter((s) => s !== current);

  const [target,      setTarget]      = useState<MemberStatusValue | null>(null);
  const [reason,      setReason]      = useState('');
  const [confirming,  setConfirming]  = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [serverError, setServerError] = useState('');
  const [reasonError, setReasonError] = useState('');

  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { closeRef.current?.focus(); }, []);

  // Escape closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function selectTarget(s: MemberStatusValue) {
    setTarget(s);
    setConfirming(false);
    setServerError('');
    setReasonError('');
  }

  function validate(): boolean {
    if (!target) return false;
    if (isDestructive(target) && reason.trim().length === 0) {
      setReasonError('A reason is required when deactivating a member.');
      return false;
    }
    return true;
  }

  // Destructive changes need an explicit confirm step before the PATCH fires.
  function handlePrimary() {
    if (!validate()) return;
    if (target && isDestructive(target) && !confirming) {
      setConfirming(true);
      return;
    }
    void submit();
  }

  async function submit() {
    if (!target) return;
    setSaving(true);
    setServerError('');

    try {
      const res = await fetch(`/api/members/${member.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: target, reason: reason.trim() || undefined }),
      });
      const json = await res.json();

      if (!res.ok) {
        setServerError(json.error ?? 'Failed to change status.');
        return;
      }

      onChanged(target);
      onClose();
    } catch {
      setServerError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const destructive = target ? isDestructive(target) : false;

  return (
    <div className="msm-overlay" role="dialog" aria-modal="true" aria-label="Change member status">
      <div className="msm-backdrop" onClick={onClose} aria-hidden="true" />

      <div className="msm-card">
        {/* Header */}
        <div className="msm-header">
          <h2 className="msm-title">Change Status</h2>
          <button ref={closeRef} type="button" className="msm-close" onClick={onClose} aria-label="Close">
            <X size={17} />
          </button>
        </div>

        <p className="msm-member-name">{member.fullName}</p>

        {/* Current status */}
        <div className="msm-current">
          <span className="msm-current__label">Current status</span>
          <span className={`msm-pill ${STATUS_META[current].cls}`}>{STATUS_META[current].label}</span>
        </div>

        {!confirming ? (
          <>
            {/* Allowed next statuses */}
            <fieldset className="msm-options">
              <legend className="msm-options__legend">Change to</legend>
              {allowedNext.map((s) => {
                const active = target === s;
                return (
                  <button
                    key={s}
                    type="button"
                    className={`msm-option${active ? ' msm-option--active' : ''}`}
                    aria-pressed={active}
                    onClick={() => selectTarget(s)}
                  >
                    <span className="msm-option__head">
                      <span className={`msm-pill ${STATUS_META[s].cls}`}>{STATUS_META[s].label}</span>
                      {isDestructive(s) && (
                        <span className="msm-option__flag">
                          <AlertTriangle size={12} aria-hidden="true" /> Needs confirmation
                        </span>
                      )}
                    </span>
                    <span className="msm-option__blurb">{STATUS_META[s].blurb}</span>
                  </button>
                );
              })}
            </fieldset>

            {/* Reason */}
            <div className="msm-field">
              <label className="msm-label" htmlFor="msm-reason">
                Reason{destructive && <span className="msm-required" aria-hidden="true"> *</span>}
                {!destructive && <span className="msm-optional"> (optional)</span>}
              </label>
              <textarea
                id="msm-reason"
                className={`msm-textarea${reasonError ? ' msm-textarea--error' : ''}`}
                value={reason}
                onChange={(e) => { setReason(e.target.value); if (reasonError) setReasonError(''); }}
                placeholder="Why is this status changing? (recorded in the member's history)"
                rows={3}
                maxLength={500}
              />
              {reasonError && <p className="msm-error" role="alert">{reasonError}</p>}
            </div>
          </>
        ) : (
          /* Confirmation step for destructive changes */
          <div className="msm-confirm" role="alert">
            <div className="msm-confirm__icon"><AlertTriangle size={20} aria-hidden="true" /></div>
            <div>
              <p className="msm-confirm__title">
                Mark {member.fullName} as{' '}
                <strong>{STATUS_META[target!].label}</strong>?
              </p>
              <p className="msm-confirm__detail">
                <span className={`msm-pill ${STATUS_META[current].cls}`}>{STATUS_META[current].label}</span>
                <ArrowRight size={13} aria-hidden="true" className="msm-confirm__arrow" />
                <span className={`msm-pill ${STATUS_META[target!].cls}`}>{STATUS_META[target!].label}</span>
              </p>
              {reason.trim() && <p className="msm-confirm__reason">“{reason.trim()}”</p>}
            </div>
          </div>
        )}

        {serverError && <p className="msm-server-error" role="alert">{serverError}</p>}

        {/* Actions */}
        <div className="msm-footer">
          {confirming ? (
            <button type="button" className="msm-btn msm-btn--secondary" onClick={() => setConfirming(false)} disabled={saving}>
              Back
            </button>
          ) : (
            <button type="button" className="msm-btn msm-btn--secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
          )}
          <button
            type="button"
            className={`msm-btn ${destructive ? 'msm-btn--danger' : 'msm-btn--primary'}`}
            onClick={handlePrimary}
            disabled={!target || saving}
          >
            {saving
              ? 'Saving…'
              : confirming
                ? `Yes, mark as ${STATUS_META[target!].label}`
                : destructive
                  ? 'Continue'
                  : 'Update status'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MemberStatusModal;
