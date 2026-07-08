'use client';

/**
 * MessageComposer — Day 31 / 32
 * Tabbed interface: SMS | Email | WhatsApp | Push
 * - SMS: character counter with 160/320/480 segment boundaries.
 * - Email: delegates to EmailComposer (TipTap rich text, Day 32).
 */
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { MessageSquare, Mail, Send, Bell } from 'lucide-react';
import type { AudienceFilters } from './AudienceSelector';
import { TemplateEditor } from './TemplateEditor';
import type { MessageTemplate } from './TemplateLibrary';

const EmailComposer = dynamic(() => import('./EmailComposer').then(m => m.EmailComposer), { ssr: false });

export type Channel = 'sms' | 'email' | 'whatsapp' | 'push';

const SMS_LIMITS = [160, 320, 480] as const;

function smsInfo(len: number) {
  const limit = SMS_LIMITS.find((s) => len <= s) ?? SMS_LIMITS[2];
  const seg   = SMS_LIMITS.indexOf(limit) + 1;
  return { limit, seg, over: len > SMS_LIMITS[2] };
}

const TABS: { id: Channel; label: string; icon: React.ReactNode }[] = [
  { id: 'sms',      label: 'SMS',      icon: <MessageSquare size={14} /> },
  { id: 'email',    label: 'Email',    icon: <Mail size={14} /> },
  { id: 'whatsapp', label: 'WhatsApp', icon: <Send size={14} /> },
  { id: 'push',     label: 'Push',     icon: <Bell size={14} /> },
];

type Props = {
  filters:          AudienceFilters;
  reach:            number;
  channel:          Channel;
  onChannelChange:  (c: Channel) => void;
  onSent?:          (result: { channel: Channel; sent: number }) => void;
  initialSubject?:  string;
  initialBody?:     string;
  activeTemplate?:  MessageTemplate | null;
  onSubjectChange?: (v: string) => void;
  onBodyChange?:    (v: string) => void;
};

export function MessageComposer({ filters, reach, channel, onChannelChange, onSent, initialSubject = '', initialBody = '', activeTemplate, onSubjectChange, onBodyChange }: Props) {
  const [subject,     setSubject]     = useState(initialSubject);
  const [body,        setBody]        = useState(initialBody);
  const [sending,     setSending]     = useState(false);
  const [serverError, setServerError] = useState('');
  const [sent,        setSent]        = useState(false);
  const [useEditor,   setUseEditor]   = useState(false);

  // Sync when a template is loaded from the library
  useEffect(() => {
    if (activeTemplate) {
      setSubject(initialSubject);
      setBody(initialBody);
      setSent(false);
      setServerError('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTemplate]);

  function handleSubjectChange(v: string) {
    setSubject(v);
    onSubjectChange?.(v);
  }

  function handleBodyChange(v: string) {
    setBody(v);
    onBodyChange?.(v);
  }

  const { limit, seg, over } = smsInfo(body.length);

  function switchChannel(c: Channel) {
    onChannelChange(c);
    setServerError('');
    setSent(false);
  }

  async function handleSend() {
    if (!body.trim()) { setServerError('Enter a message body.'); return; }
    if (channel === 'push' && !subject.trim()) { setServerError('Enter a notification title.'); return; }
    setSending(true);
    setServerError('');
    try {
      const res  = await fetch('/api/communication/send', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ channel, subject, body: body.trim(), filters }),
      });
      const json = await res.json() as { sent?: number; error?: string };
      if (!res.ok) { setServerError(json.error ?? 'Failed to send.'); return; }
      setSent(true);
      onSent?.({ channel, sent: json.sent ?? reach });
    } catch {
      setServerError('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  }

  const tabBar = (
    <div className="comm-tabs" role="tablist" aria-label="Message channel">
      {TABS.map(({ id, label, icon }) => (
        <button
          key={id} type="button" role="tab"
          aria-selected={channel === id}
          className={`comm-tab${channel === id ? ' comm-tab--active' : ''}`}
          onClick={() => switchChannel(id)}
        >
          {icon} {label}
        </button>
      ))}
    </div>
  );

  // Email tab — full rich-text composer
  if (channel === 'email') {
    return (
      <div className="comm-composer">
        {tabBar}
        <EmailComposer
          filters={filters}
          reach={reach}
          onSent={({ sent }) => {
            setSent(true);
            onSent?.({ channel: 'email', sent });
          }}
        />
      </div>
    );
  }

  // Template editor mode (non-email channels)
  if (useEditor) {
    return (
      <div className="comm-composer">
        {tabBar}
        <TemplateEditor
          initialTemplate={activeTemplate}
          subject={subject}
          body={body}
          onSubjectChange={handleSubjectChange}
          onBodyChange={handleBodyChange}
        />
        {serverError && <p className="comm-error" role="alert">{serverError}</p>}
        <div className="comm-composer__footer">
          <button type="button" className="comm-btn comm-btn--secondary" onClick={() => setUseEditor(false)}>Simple mode</button>
          <span className="comm-composer__reach-hint">
            Sending to <strong>{reach.toLocaleString()}</strong> recipient{reach !== 1 ? 's' : ''}
          </span>
          <button
            type="button"
            className="comm-btn comm-btn--primary"
            onClick={handleSend}
            disabled={sending || !body.trim() || reach === 0}
          >
            {sending ? 'Sending…' : `Send ${channel.toUpperCase()}`}
          </button>
        </div>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="comm-composer comm-composer--sent">
        <span className="comm-composer__sent-icon">✓</span>
        <p className="comm-composer__sent-msg">
          Message queued for <strong>{reach.toLocaleString()}</strong> recipient{reach !== 1 ? 's' : ''}.
        </p>
        <button
          type="button"
          className="comm-btn comm-btn--secondary"
          onClick={() => { setSent(false); setBody(''); setSubject(''); }}
        >
          Compose another
        </button>
      </div>
    );
  }

  return (
    <div className="comm-composer">
      {tabBar}

      <div className="comm-composer__fields">
        {channel === 'push' && (
          <div className="comm-field">
            <label className="comm-label" htmlFor="comm-push-title">Notification Title</label>
            <input
              id="comm-push-title"
              className="comm-input"
              type="text"
              value={subject}
              onChange={(e) => { handleSubjectChange(e.target.value); setServerError(''); }}
              placeholder="Short title…"
            />
          </div>
        )}

        <div className="comm-field">
          <div className="comm-label-row">
            <label className="comm-label" htmlFor="comm-body">Message</label>
            {channel === 'sms' && (
              <span className={`comm-sms-counter${over ? ' comm-sms-counter--over' : ''}`}>
                {body.length} / {limit} · {seg} segment{seg !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <textarea
            id="comm-body"
            className={`comm-textarea${over ? ' comm-textarea--error' : ''}`}
            value={body}
            onChange={(e) => { handleBodyChange(e.target.value); setServerError(''); }}
            placeholder={
              channel === 'sms'      ? 'Your SMS message…' :
              channel === 'whatsapp' ? 'WhatsApp message…' :
                                       'Push notification text…'
            }
            rows={4}
          />
          {channel === 'sms' && (
            <div className="comm-sms-track" aria-hidden="true">
              <div
                className={`comm-sms-fill${over ? ' comm-sms-fill--over' : ''}`}
                style={{ width: `${Math.min((body.length / SMS_LIMITS[2]) * 100, 100)}%` }}
              />
              {SMS_LIMITS.map((s) => (
                <span key={s} className="comm-sms-mark" style={{ left: `${(s / SMS_LIMITS[2]) * 100}%` }} />
              ))}
            </div>
          )}
        </div>
      </div>

      {serverError && <p className="comm-error" role="alert">{serverError}</p>}

      <div className="comm-composer__footer">
        <button type="button" className="comm-btn comm-btn--secondary" onClick={() => setUseEditor(true)}>Variable editor</button>
        <span className="comm-composer__reach-hint">
          Sending to <strong>{reach.toLocaleString()}</strong> recipient{reach !== 1 ? 's' : ''}
        </span>
        <button
          type="button"
          className="comm-btn comm-btn--primary"
          onClick={handleSend}
          disabled={sending || over || !body.trim() || reach === 0}
        >
          {sending ? 'Sending…' : `Send ${channel.toUpperCase()}`}
        </button>
      </div>
    </div>
  );
}

export default MessageComposer;
