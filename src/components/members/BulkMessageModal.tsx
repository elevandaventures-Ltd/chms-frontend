'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { X, Mail, MessageSquare } from 'lucide-react';
import type { Member } from '@/lib/site';

type Channel = 'sms' | 'email';

type BulkMessageModalProps = {
  recipients: Member[];
  onClose:    () => void;
  onSent:     (result: { sent: number; skipped: number; channel: Channel }) => void;
};

const MAX_SMS = 480; // ~3 SMS segments

// ── Component ─────────────────────────────────────────────────────────────────

export function BulkMessageModal({ recipients, onClose, onSent }: BulkMessageModalProps) {
  const [channel,     setChannel]     = useState<Channel>('sms');
  const [message,     setMessage]     = useState('');
  const [sending,     setSending]     = useState(false);
  const [serverError, setServerError] = useState('');

  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { closeRef.current?.focus(); }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Reachable recipients depend on the channel (phone for SMS, email for email).
  const { reachable, unreachable } = useMemo(() => {
    const has = (m: Member) => (channel === 'sms' ? Boolean(m.phone) : Boolean(m.email));
    return {
      reachable:   recipients.filter(has),
      unreachable: recipients.filter((m) => !has(m)),
    };
  }, [recipients, channel]);

  const overLimit = channel === 'sms' && message.length > MAX_SMS;

  async function send() {
    if (message.trim().length === 0) {
      setServerError('Enter a message to send.');
      return;
    }
    if (reachable.length === 0) {
      setServerError(`None of the selected members have a ${channel === 'sms' ? 'phone number' : 'email address'}.`);
      return;
    }
    setSending(true);
    setServerError('');

    try {
      const res = await fetch('/api/members/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: recipients.map((m) => m.id), channel, message: message.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error ?? 'Failed to send message.');
        return;
      }
      onSent({ sent: json.sent ?? reachable.length, skipped: json.skipped ?? unreachable.length, channel });
      onClose();
    } catch {
      setServerError('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="msm-overlay" role="dialog" aria-modal="true" aria-label="Send message to selected members">
      <div className="msm-backdrop" onClick={onClose} aria-hidden="true" />

      <div className="msm-card msm-card--wide">
        <div className="msm-header">
          <h2 className="msm-title">Send Message</h2>
          <button ref={closeRef} type="button" className="msm-close" onClick={onClose} aria-label="Close">
            <X size={17} />
          </button>
        </div>

        {/* Channel toggle */}
        <div className="bulk-mode" role="radiogroup" aria-label="Channel">
          <button
            type="button"
            role="radio"
            aria-checked={channel === 'sms' ? 'true' : 'false'}
            className={`bulk-mode__opt${channel === 'sms' ? ' bulk-mode__opt--active' : ''}`}
            onClick={() => setChannel('sms')}
          >
            <MessageSquare size={14} aria-hidden="true" /> SMS
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={channel === 'email' ? 'true' : 'false'}
            className={`bulk-mode__opt${channel === 'email' ? ' bulk-mode__opt--active' : ''}`}
            onClick={() => setChannel('email')}
          >
            <Mail size={14} aria-hidden="true" /> Email
          </button>
        </div>

        {/* Recipients */}
        <div className="bulk-msg__recipients">
          <span className="msm-current__label">
            To {reachable.length} recipient{reachable.length === 1 ? '' : 's'}
            {unreachable.length > 0 && ` · ${unreachable.length} skipped (no ${channel === 'sms' ? 'phone' : 'email'})`}
          </span>
          <div className="bulk-msg__chips">
            {recipients.map((m) => {
              const ok = channel === 'sms' ? Boolean(m.phone) : Boolean(m.email);
              return (
                <span key={m.id} className={`bulk-msg__chip${ok ? '' : ' bulk-msg__chip--muted'}`}>
                  {m.fullName}
                </span>
              );
            })}
          </div>
        </div>

        {/* Message */}
        <div className="msm-field">
          <label className="msm-label" htmlFor="bulk-msg-body">Message</label>
          <textarea
            id="bulk-msg-body"
            className={`msm-textarea${overLimit ? ' msm-textarea--error' : ''}`}
            value={message}
            onChange={(e) => { setMessage(e.target.value); if (serverError) setServerError(''); }}
            placeholder={channel === 'sms' ? 'Your SMS message…' : 'Your email message…'}
            rows={4}
          />
          {channel === 'sms' && (
            <p className={`bulk-msg__counter${overLimit ? ' bulk-msg__counter--error' : ''}`}>
              {message.length} / {MAX_SMS} characters
            </p>
          )}
        </div>

        {serverError && <p className="msm-server-error" role="alert">{serverError}</p>}

        <div className="msm-footer">
          <button type="button" className="msm-btn msm-btn--secondary" onClick={onClose} disabled={sending}>
            Cancel
          </button>
          <button
            type="button"
            className="msm-btn msm-btn--primary"
            onClick={send}
            disabled={sending || overLimit || message.trim().length === 0 || reachable.length === 0}
          >
            {sending ? 'Sending…' : `Send to ${reachable.length}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BulkMessageModal;
