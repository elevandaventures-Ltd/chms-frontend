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
import { ScheduleControls, type SendMode } from './ScheduleControls';
import { SendConfirmationDialog } from './SendConfirmationDialog';
import { zonedWallTimeToUtcIso, AFRICA_TIMEZONES } from '@/lib/communication';
import { WhatsAppComposer } from './WhatsAppComposer';

const EmailComposer = dynamic(() => import('./EmailComposer').then(m => m.EmailComposer), { ssr: false });

export type Channel = 'sms' | 'email' | 'whatsapp' | 'push';

const SMS_LIMITS = [160, 320, 480] as const;

function smsInfo(len: number) {
  const limit = SMS_LIMITS.find((s) => len <= s) ?? SMS_LIMITS[2];
  const seg   = SMS_LIMITS.indexOf(limit) + 1;
  return { limit, seg, over: len > SMS_LIMITS[2] };
}

function guessTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (AFRICA_TIMEZONES.some((z) => z.value === tz)) return tz;
  } catch { /* Intl unsupported — fall through to default */ }
  return 'Africa/Nairobi';
}

function defaultScheduleDateTime(): { date: string; time: string } {
  const d = new Date(Date.now() + 60 * 60_000); // +1h, a sane starting point
  return {
    date: d.toISOString().slice(0, 10),
    time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
  };
}

function scheduleSummaryText(date: string, time: string, timezone: string): string {
  const iso = zonedWallTimeToUtcIso(date, time, timezone);
  const label = AFRICA_TIMEZONES.find((z) => z.value === timezone)?.label ?? timezone;
  return `${new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })} (${label})`;
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

  // Day 34 — scheduling
  const [sendMode,      setSendMode]      = useState<SendMode>('now');
  const [schedDate,     setSchedDate]     = useState(() => defaultScheduleDateTime().date);
  const [schedTime,     setSchedTime]     = useState(() => defaultScheduleDateTime().time);
  const [schedTimezone, setSchedTimezone] = useState(guessTimezone);
  const [showConfirm,   setShowConfirm]   = useState(false);
  const [scheduledSummary, setScheduledSummary] = useState<string | null>(null);

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
      const json = await res.json() as { sent?: number; error?: string; message?: string; retryAfterSeconds?: number };
      if (!res.ok) {
        setServerError(json.message ?? json.error ?? 'Failed to send.');
        return;
      }
      setSent(true);
      onSent?.({ channel, sent: json.sent ?? reach });
    } catch {
      setServerError('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  }

  async function handleSchedule() {
    setSending(true);
    setServerError('');
    try {
      const sendAtUtc = zonedWallTimeToUtcIso(schedDate, schedTime, schedTimezone);
      const res = await fetch('/api/communication/schedule', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ channel, subject, body: body.trim(), filters, reach, sendAtUtc, timezone: schedTimezone }),
      });
      const json = await res.json() as { data?: unknown; message?: string; error?: string };
      if (!res.ok) { setServerError(json.message ?? json.error ?? 'Failed to schedule.'); return; }
      setScheduledSummary(scheduleSummaryText(schedDate, schedTime, schedTimezone));
    } catch {
      setServerError('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  }

  function validateBeforeConfirm(): string | null {
    if (!body.trim()) return 'Enter a message body.';
    if (channel === 'push' && !subject.trim()) return 'Enter a notification title.';
    if (sendMode === 'schedule') {
      if (!schedDate || !schedTime) return 'Pick a date and time.';
      const iso = zonedWallTimeToUtcIso(schedDate, schedTime, schedTimezone);
      if (new Date(iso).getTime() <= Date.now()) return 'Scheduled time must be in the future.';
    }
    return null;
  }

  function openConfirm() {
    const err = validateBeforeConfirm();
    if (err) { setServerError(err); return; }
    setServerError('');
    setShowConfirm(true);
  }

  async function handleDialogConfirm() {
    if (sendMode === 'now') await handleSend();
    else await handleSchedule();
    setShowConfirm(false);
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

  // WhatsApp tab — approved-template bulk composer + phone preview (Day 36)
  if (channel === 'whatsapp') {
    return (
      <div className="comm-composer">
        {tabBar}
        <WhatsAppComposer
          filters={filters}
          reach={reach}
          onSent={({ sent: sentCount }) => {
            setSent(true);
            onSent?.({ channel: 'whatsapp', sent: sentCount });
          }}
        />
      </div>
    );
  }

  // Template editor mode (non-email, non-WhatsApp channels)
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
        <ScheduleControls
          mode={sendMode} onModeChange={setSendMode}
          date={schedDate} time={schedTime} timezone={schedTimezone}
          onDateChange={setSchedDate} onTimeChange={setSchedTime} onTimezoneChange={setSchedTimezone}
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
            onClick={openConfirm}
            disabled={sending || !body.trim() || reach === 0}
          >
            {sendMode === 'schedule' ? 'Review & schedule' : `Send ${channel.toUpperCase()}`}
          </button>
        </div>
        <SendConfirmationDialog
          open={showConfirm} onClose={() => setShowConfirm(false)}
          channel={channel} reach={reach} filters={filters} mode={sendMode}
          scheduleSummary={sendMode === 'schedule' ? scheduleSummaryText(schedDate, schedTime, schedTimezone) : undefined}
          onConfirm={handleDialogConfirm}
        />
      </div>
    );
  }

  if (scheduledSummary) {
    return (
      <div className="comm-composer comm-composer--sent">
        <span className="comm-composer__sent-icon">🕒</span>
        <p className="comm-composer__sent-msg">
          Scheduled for <strong>{reach.toLocaleString()}</strong> recipient{reach !== 1 ? 's' : ''} on <strong>{scheduledSummary}</strong>. Manage it from the Scheduled tab.
        </p>
        <button
          type="button"
          className="comm-btn comm-btn--secondary"
          onClick={() => { setScheduledSummary(null); setBody(''); setSubject(''); }}
        >
          Compose another
        </button>
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
            placeholder={channel === 'sms' ? 'Your SMS message…' : 'Push notification text…'}
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

      <ScheduleControls
        mode={sendMode} onModeChange={setSendMode}
        date={schedDate} time={schedTime} timezone={schedTimezone}
        onDateChange={setSchedDate} onTimeChange={setSchedTime} onTimezoneChange={setSchedTimezone}
      />

      {serverError && <p className="comm-error" role="alert">{serverError}</p>}

      <div className="comm-composer__footer">
        <button type="button" className="comm-btn comm-btn--secondary" onClick={() => setUseEditor(true)}>Variable editor</button>
        <span className="comm-composer__reach-hint">
          Sending to <strong>{reach.toLocaleString()}</strong> recipient{reach !== 1 ? 's' : ''}
        </span>
        <button
          type="button"
          className="comm-btn comm-btn--primary"
          onClick={openConfirm}
          disabled={sending || over || !body.trim() || reach === 0}
        >
          {sendMode === 'schedule' ? 'Review & schedule' : `Send ${channel.toUpperCase()}`}
        </button>
      </div>

      <SendConfirmationDialog
        open={showConfirm} onClose={() => setShowConfirm(false)}
        channel={channel} reach={reach} filters={filters} mode={sendMode}
        scheduleSummary={sendMode === 'schedule' ? scheduleSummaryText(schedDate, schedTime, schedTimezone) : undefined}
        onConfirm={handleDialogConfirm}
      />
    </div>
  );
}

export default MessageComposer;
