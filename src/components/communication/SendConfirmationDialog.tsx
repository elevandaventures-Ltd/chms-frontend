'use client';

/**
 * SendConfirmationDialog — Day 35.
 * "You are about to send to 247 members via SMS. Estimated delivery:
 * 3 minutes. Confirm?" — with a member-count breakdown by segment.
 */
import { useEffect, useState } from 'react';
import { AlertTriangle, Users } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { AudienceFilters } from './AudienceSelector';
import type { Channel } from './MessageComposer';

/** Mirrors lib/rate-limit.ts GATEWAY_LIMIT_PER_MINUTE — duplicated as a small
 *  pure client-side estimate so this component doesn't pull server-only
 *  rate-limiting state into the browser bundle. */
const GATEWAY_LIMIT_PER_MINUTE: Record<Channel, number> = { sms: 60, whatsapp: 80, email: 500, push: 1000 };

const CHANNEL_LABEL: Record<Channel, string> = { sms: 'SMS', email: 'Email', whatsapp: 'WhatsApp', push: 'Push' };
const STATUS_LABEL: Record<string, string> = { active: 'Active', inactive: 'Inactive', visitor: 'Visitor' };

function estimateDelivery(channel: Channel, count: number) {
  const perSecond = Math.max(1, Math.round(GATEWAY_LIMIT_PER_MINUTE[channel] / 60));
  const seconds = Math.ceil(count / perSecond);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
}

type Props = {
  open: boolean;
  onClose: () => void;
  channel: Channel;
  reach: number;
  filters: AudienceFilters;
  mode: 'now' | 'schedule';
  scheduleSummary?: string; // e.g. "Fri, Aug 1 at 9:00 AM (Africa/Lagos)"
  onConfirm: () => Promise<void> | void;
};

export function SendConfirmationDialog({ open, onClose, channel, reach, filters, mode, scheduleSummary, onConfirm }: Props) {
  const [breakdown, setBreakdown] = useState<Record<string, number> | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) { setBreakdown(null); return; }
    let cancelled = false;
    fetch('/api/communication/reach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...filters, channel }),
    })
      .then((r) => r.json())
      .then((json: { breakdown?: { byStatus?: Record<string, number> } }) => {
        if (!cancelled) setBreakdown(json.breakdown?.byStatus ?? {});
      })
      .catch(() => { if (!cancelled) setBreakdown({}); });
    return () => { cancelled = true; };
  }, [open, channel, filters]);

  if (!open) return null;

  const otherFilterChips = [
    ...filters.ministries.map((m) => `Ministry: ${m}`),
    ...filters.ageGroups.map((a) => `Age: ${a.replace('_', ' ')}`),
    ...filters.zones.map((z) => `Zone: ${z}`),
  ];

  async function handleConfirm() {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Confirm send">
      <div className="scd">
        <p className="scd__headline">
          You are about to {mode === 'schedule' ? 'schedule' : 'send'} to{' '}
          <strong>{reach.toLocaleString()}</strong> member{reach !== 1 ? 's' : ''} via <strong>{CHANNEL_LABEL[channel]}</strong>.
        </p>

        {mode === 'schedule' ? (
          <p className="scd__meta"><strong>Send time:</strong> {scheduleSummary}</p>
        ) : (
          <p className="scd__meta"><strong>Estimated delivery:</strong> {estimateDelivery(channel, reach)}</p>
        )}

        <div className="scd__breakdown">
          <span className="scd__breakdown-title"><Users size={13} aria-hidden="true" /> Recipient breakdown</span>
          {breakdown === null ? (
            <span className="scd__breakdown-loading">Loading…</span>
          ) : (
            <div className="scd__breakdown-rows">
              {(['active', 'inactive', 'visitor'] as const).map((status) => (
                breakdown[status] ? (
                  <span key={status} className="scd__breakdown-pill">
                    {STATUS_LABEL[status]}: <strong>{breakdown[status]}</strong>
                  </span>
                ) : null
              ))}
              {otherFilterChips.map((chip) => (
                <span key={chip} className="scd__breakdown-pill scd__breakdown-pill--muted">{chip}</span>
              ))}
              {otherFilterChips.length === 0 && Object.keys(breakdown).length === 0 && (
                <span className="scd__breakdown-pill scd__breakdown-pill--muted">All members</span>
              )}
            </div>
          )}
        </div>

        {reach > GATEWAY_LIMIT_PER_MINUTE[channel] && mode === 'now' && (
          <div className="scd__warning">
            <AlertTriangle size={14} aria-hidden="true" />
            This exceeds the {CHANNEL_LABEL[channel]} gateway's per-minute limit ({GATEWAY_LIMIT_PER_MINUTE[channel]}) — delivery will be throttled in batches automatically.
          </div>
        )}

        <div className="scd__actions">
          <button type="button" className="sa-btn sa-btn--secondary" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="button" className="sa-btn sa-btn--primary" onClick={handleConfirm} disabled={busy || reach === 0}>
            {busy ? 'Working…' : mode === 'schedule' ? 'Confirm schedule' : 'Confirm & send'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default SendConfirmationDialog;
