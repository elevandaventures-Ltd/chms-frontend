'use client';

/**
 * DeliveryReport — Day 32
 * Table of sent messages: Channel, Recipients, Delivered %, Opened % (email), Sent Time, Status.
 */
import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Mail, MessageSquare, Send, Bell } from 'lucide-react';

export type MessageReport = {
  id:           string;
  channel:      'sms' | 'email' | 'whatsapp' | 'push';
  subject?:     string;
  recipients:   number;
  delivered:    number;
  opened?:      number;   // email only
  sentAt:       string;   // ISO
  status:       'sent' | 'sending' | 'failed' | 'partial';
};

const CHANNEL_ICON: Record<MessageReport['channel'], React.ReactNode> = {
  sms:      <MessageSquare size={13} />,
  email:    <Mail size={13} />,
  whatsapp: <Send size={13} />,
  push:     <Bell size={13} />,
};

const CHANNEL_LABEL: Record<MessageReport['channel'], string> = {
  sms: 'SMS', email: 'Email', whatsapp: 'WhatsApp', push: 'Push',
};

const STATUS_CLASS: Record<MessageReport['status'], string> = {
  sent:    'dr-status--sent',
  sending: 'dr-status--sending',
  failed:  'dr-status--failed',
  partial: 'dr-status--partial',
};

function pct(n: number, total: number) {
  if (total === 0) return '—';
  return `${Math.round((n / total) * 100)}%`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// Mock data shown when the API returns nothing
const MOCK_REPORTS: MessageReport[] = [
  { id: 'r1', channel: 'email',    subject: 'Sunday Service Reminder',  recipients: 18, delivered: 17, opened: 11, sentAt: new Date(Date.now() - 3_600_000).toISOString(),  status: 'sent' },
  { id: 'r2', channel: 'sms',      subject: undefined,                  recipients: 14, delivered: 14, sentAt: new Date(Date.now() - 7_200_000).toISOString(),  status: 'sent' },
  { id: 'r3', channel: 'whatsapp', subject: undefined,                  recipients: 8,  delivered: 7,  sentAt: new Date(Date.now() - 86_400_000).toISOString(), status: 'partial' },
  { id: 'r4', channel: 'push',     subject: 'Youth Night Tonight',      recipients: 20, delivered: 19, sentAt: new Date(Date.now() - 172_800_000).toISOString(),status: 'sent' },
  { id: 'r5', channel: 'email',    subject: 'Monthly Newsletter',       recipients: 20, delivered: 20, opened: 14, sentAt: new Date(Date.now() - 259_200_000).toISOString(),status: 'sent' },
];

export function DeliveryReport() {
  const [reports,  setReports]  = useState<MessageReport[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res  = await fetch('/api/communication/reports');
      const json = await res.json() as { data?: MessageReport[] };
      setReports(json.data && json.data.length > 0 ? json.data : MOCK_REPORTS);
    } catch {
      setReports(MOCK_REPORTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <div className="dr-wrap">
      <div className="dr-header">
        <h2 className="dr-title">Delivery Reports</h2>
        <button
          type="button"
          className="dr-refresh"
          onClick={load}
          disabled={loading}
          aria-label="Refresh reports"
        >
          <RefreshCw size={14} className={loading ? 'dr-refresh--spin' : ''} />
          Refresh
        </button>
      </div>

      {error && <p className="comm-error">{error}</p>}

      <div className="dr-table-wrap">
        <table className="dr-table">
          <thead>
            <tr>
              <th className="dr-th">Channel</th>
              <th className="dr-th">Subject / Message</th>
              <th className="dr-th dr-th--num">Recipients</th>
              <th className="dr-th dr-th--num">Delivered</th>
              <th className="dr-th dr-th--num">Opened</th>
              <th className="dr-th">Sent</th>
              <th className="dr-th">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="dr-row dr-row--skeleton">
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} className="dr-td">
                      <div className="skeleton-shimmer" style={{ height: 12, borderRadius: 6, width: j === 1 ? '80%' : '60%' }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan={7} className="dr-empty">No messages sent yet.</td>
              </tr>
            ) : (
              reports.map((r) => (
                <tr key={r.id} className="dr-row">
                  <td className="dr-td">
                    <span className={`dr-channel dr-channel--${r.channel}`}>
                      {CHANNEL_ICON[r.channel]}
                      {CHANNEL_LABEL[r.channel]}
                    </span>
                  </td>
                  <td className="dr-td dr-td--subject">
                    {r.subject ?? <span className="dr-muted">—</span>}
                  </td>
                  <td className="dr-td dr-td--num">{r.recipients.toLocaleString()}</td>
                  <td className="dr-td dr-td--num">
                    <span className="dr-pct">
                      <span
                        className="dr-pct__bar"
                        style={{ '--w': `${Math.round((r.delivered / r.recipients) * 100)}%` } as React.CSSProperties}
                      />
                      {pct(r.delivered, r.recipients)}
                    </span>
                  </td>
                  <td className="dr-td dr-td--num">
                    {r.channel === 'email' && r.opened != null ? (
                      <span className="dr-pct">
                        <span
                          className="dr-pct__bar dr-pct__bar--open"
                          style={{ '--w': `${Math.round((r.opened / r.recipients) * 100)}%` } as React.CSSProperties}
                        />
                        {pct(r.opened, r.recipients)}
                      </span>
                    ) : (
                      <span className="dr-muted">—</span>
                    )}
                  </td>
                  <td className="dr-td dr-td--date">{fmtDate(r.sentAt)}</td>
                  <td className="dr-td">
                    <span className={`dr-status ${STATUS_CLASS[r.status]}`}>
                      {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DeliveryReport;
