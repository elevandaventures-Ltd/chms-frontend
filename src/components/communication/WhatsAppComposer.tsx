'use client';

/**
 * WhatsAppComposer — Day 36.
 * Template selector restricted to approved templates (WhatsApp Business
 * API only allows pre-approved templates for outbound bulk messages),
 * variable field inputs, a recipient list, and a live phone-mockup
 * preview. Also supports Day 34 scheduling + Day 35 send confirmation,
 * same as the SMS/Push composer.
 */
import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock3, Users, XCircle } from 'lucide-react';
import { WHATSAPP_TEMPLATES, resolveWhatsAppTemplate, zonedWallTimeToUtcIso } from '@/lib/communication';
import { WhatsAppPhonePreview } from './WhatsAppPhonePreview';
import { ScheduleControls, type SendMode } from './ScheduleControls';
import { SendConfirmationDialog } from './SendConfirmationDialog';
import type { AudienceFilters } from './AudienceSelector';

function guessTimezone(): string {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Nairobi'; }
  catch { return 'Africa/Nairobi'; }
}

function defaultScheduleDateTime(): { date: string; time: string } {
  const d = new Date(Date.now() + 60 * 60_000);
  return { date: d.toISOString().slice(0, 10), time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` };
}

type Props = {
  filters: AudienceFilters;
  reach: number;
  onSent: (result: { sent: number }) => void;
};

export function WhatsAppComposer({ filters, reach, onSent }: Props) {
  const approvedTemplates = WHATSAPP_TEMPLATES.filter((t) => t.status === 'approved');
  const unapprovedCount = WHATSAPP_TEMPLATES.length - approvedTemplates.length;

  const [templateId, setTemplateId] = useState(approvedTemplates[0]?.id ?? '');
  const [values, setValues] = useState<string[]>(() => approvedTemplates[0]?.variables.map(() => '') ?? []);
  const [sampleNames, setSampleNames] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [sendMode, setSendMode] = useState<SendMode>('now');
  const [schedDate, setSchedDate] = useState(() => defaultScheduleDateTime().date);
  const [schedTime, setSchedTime] = useState(() => defaultScheduleDateTime().time);
  const [schedTimezone, setSchedTimezone] = useState(guessTimezone);
  const [showConfirm, setShowConfirm] = useState(false);
  const [result, setResult] = useState<'sent' | 'scheduled' | null>(null);

  const template = approvedTemplates.find((t) => t.id === templateId) ?? null;

  useEffect(() => {
    setValues(template?.variables.map(() => '') ?? []);
  }, [templateId, template?.variables]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/communication/reach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...filters, channel: 'whatsapp' }),
    })
      .then((r) => r.json())
      .then((json: { sampleNames?: string[] }) => { if (!cancelled) setSampleNames(json.sampleNames ?? []); })
      .catch(() => { if (!cancelled) setSampleNames([]); });
    return () => { cancelled = true; };
  }, [filters]);

  const resolvedBody = useMemo(
    () => (template ? resolveWhatsAppTemplate(template.body, values) : ''),
    [template, values],
  );

  function validate(): string | null {
    if (!template) return 'Choose an approved template.';
    if (values.some((v) => !v.trim())) return 'Fill in every template variable.';
    if (sendMode === 'schedule') {
      if (!schedDate || !schedTime) return 'Pick a date and time.';
      const iso = zonedWallTimeToUtcIso(schedDate, schedTime, schedTimezone);
      if (new Date(iso).getTime() <= Date.now()) return 'Scheduled time must be in the future.';
    }
    return null;
  }

  function openConfirm() {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setShowConfirm(true);
  }

  async function handleConfirm() {
    setSending(true);
    setError('');
    try {
      if (sendMode === 'now') {
        const res = await fetch('/api/communication/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channel: 'whatsapp', body: resolvedBody, filters }),
        });
        const json = await res.json() as { sent?: number; message?: string; error?: string };
        if (!res.ok) { setError(json.message ?? json.error ?? 'Failed to send.'); return; }
        setResult('sent');
        onSent({ sent: json.sent ?? reach });
      } else {
        const sendAtUtc = zonedWallTimeToUtcIso(schedDate, schedTime, schedTimezone);
        const res = await fetch('/api/communication/schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channel: 'whatsapp', body: resolvedBody, filters, reach, sendAtUtc, timezone: schedTimezone }),
        });
        const json = await res.json() as { message?: string; error?: string };
        if (!res.ok) { setError(json.message ?? json.error ?? 'Failed to schedule.'); return; }
        setResult('scheduled');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSending(false);
      setShowConfirm(false);
    }
  }

  if (result) {
    return (
      <div className="comm-composer comm-composer--sent">
        <span className="comm-composer__sent-icon">{result === 'sent' ? '✓' : '🕒'}</span>
        <p className="comm-composer__sent-msg">
          {result === 'sent'
            ? <>WhatsApp message queued for <strong>{reach.toLocaleString()}</strong> recipient{reach !== 1 ? 's' : ''}.</>
            : <>WhatsApp message scheduled for <strong>{schedDate} {schedTime}</strong> ({schedTimezone}). Manage it from the Scheduled tab.</>}
        </p>
        <button type="button" className="comm-btn comm-btn--secondary" onClick={() => setResult(null)}>
          Compose another
        </button>
      </div>
    );
  }

  return (
    <div className="wa-composer">
      <div className="wa-composer__main">
        <div className="wa-field">
          <label htmlFor="wa-template">Approved template</label>
          <select id="wa-template" value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
            {approvedTemplates.map((t) => (
              <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
            ))}
          </select>
          {unapprovedCount > 0 && (
            <p className="wa-field__hint">
              <XCircle size={12} aria-hidden="true" /> {unapprovedCount} other template{unapprovedCount !== 1 ? 's are' : ' is'} pending/rejected WhatsApp approval and can&apos;t be used for bulk sends.
            </p>
          )}
        </div>

        {template && (
          <div className="wa-vars">
            {template.variables.map((label, i) => (
              <div key={label} className="wa-field">
                <label htmlFor={`wa-var-${i}`}>{label}</label>
                <input
                  id={`wa-var-${i}`}
                  value={values[i] ?? ''}
                  onChange={(e) => setValues((v) => v.map((x, idx) => (idx === i ? e.target.value : x)))}
                  placeholder={`Enter ${label.toLowerCase()}…`}
                />
              </div>
            ))}
          </div>
        )}

        <div className="wa-recipients">
          <span className="wa-recipients__title"><Users size={13} aria-hidden="true" /> Recipients ({reach.toLocaleString()})</span>
          <div className="wa-recipients__list">
            {sampleNames.length === 0 ? (
              <span className="wa-recipients__empty">No matching members yet — adjust your audience filters.</span>
            ) : (
              <>
                {sampleNames.map((name) => <span key={name} className="wa-recipients__chip">{name}</span>)}
                {reach > sampleNames.length && <span className="wa-recipients__chip wa-recipients__chip--muted">+{reach - sampleNames.length} more</span>}
              </>
            )}
          </div>
        </div>

        <ScheduleControls
          mode={sendMode} onModeChange={setSendMode}
          date={schedDate} time={schedTime} timezone={schedTimezone}
          onDateChange={setSchedDate} onTimeChange={setSchedTime} onTimezoneChange={setSchedTimezone}
        />

        {error && <p className="comm-error" role="alert">{error}</p>}

        <div className="comm-composer__footer">
          <span className="comm-composer__reach-hint">
            <CheckCircle2 size={13} aria-hidden="true" style={{ verticalAlign: -2 }} /> Approved for bulk WhatsApp send
          </span>
          <button type="button" className="comm-btn comm-btn--primary" onClick={openConfirm} disabled={sending || !template}>
            {sendMode === 'schedule' ? <><Clock3 size={14} aria-hidden="true" /> Review & schedule</> : 'Send WhatsApp'}
          </button>
        </div>
      </div>

      <div className="wa-composer__preview">
        <WhatsAppPhonePreview body={resolvedBody} />
      </div>

      <SendConfirmationDialog
        open={showConfirm} onClose={() => setShowConfirm(false)}
        channel="whatsapp" reach={reach} filters={filters} mode={sendMode}
        scheduleSummary={sendMode === 'schedule' ? `${schedDate} ${schedTime} (${schedTimezone})` : undefined}
        onConfirm={handleConfirm}
      />
    </div>
  );
}

export default WhatsAppComposer;
