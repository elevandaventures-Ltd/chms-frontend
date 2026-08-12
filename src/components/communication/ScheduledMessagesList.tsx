'use client';

/**
 * ScheduledMessagesList — Day 34.
 * Upcoming scheduled messages: send time, channel, recipient count, and a
 * Cancel button. Polls /api/communication/schedule/process every few
 * seconds so due messages actually fire while this tab is open (see that
 * route's doc comment — there's no server-side cron in this project).
 */
import { useCallback, useEffect, useState } from 'react';
import { Mail, MessageSquare, Send, Bell, X, RefreshCw } from 'lucide-react';
import type { ScheduledMessage } from '@/lib/communication';

const CHANNEL_ICON: Record<ScheduledMessage['channel'], React.ReactNode> = {
  sms: <MessageSquare size={13} />, email: <Mail size={13} />, whatsapp: <Send size={13} />, push: <Bell size={13} />,
};

const STATUS_LABEL: Record<ScheduledMessage['status'], string> = {
  scheduled: 'Scheduled', sent: 'Sent', canceled: 'Canceled', failed: 'Failed',
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function ScheduledMessagesList() {
  const [messages, setMessages] = useState<ScheduledMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/communication/schedule');
      const json = await res.json() as { data?: ScheduledMessage[] };
      setMessages(json.data ?? []);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  // Poll: check for due messages, then refresh the list either way.
  useEffect(() => {
    const tick = async () => {
      try { await fetch('/api/communication/schedule/process', { method: 'POST' }); } catch { /* ignore */ }
      void load();
    };
    const id = setInterval(tick, 5000);
    return () => clearInterval(id);
  }, [load]);

  async function handleCancel(id: string) {
    setCanceling(id);
    try {
      await fetch(`/api/communication/schedule/${id}`, { method: 'DELETE' });
      await load();
    } finally {
      setCanceling(null);
    }
  }

  const upcoming = messages.filter((m) => m.status === 'scheduled');
  const history  = messages.filter((m) => m.status !== 'scheduled');

  return (
    <div className="sched-list">
      <div className="sched-list__head">
        <h3>Upcoming ({upcoming.length})</h3>
        <button type="button" className="dr-refresh" onClick={load} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'dr-refresh--spin' : ''} /> Refresh
        </button>
      </div>

      {upcoming.length === 0 ? (
        <p className="sched-list__empty">No messages scheduled. Compose one and choose "Schedule".</p>
      ) : (
        <div className="sched-list__rows">
          {upcoming.map((m) => (
            <div key={m.id} className="sched-list__row">
              <span className={`dr-channel dr-channel--${m.channel}`}>{CHANNEL_ICON[m.channel]}</span>
              <div className="sched-list__body">
                <strong>{m.subject || m.body.slice(0, 60) || 'Untitled message'}</strong>
                <span>{fmt(m.sendAtUtc)} · {m.timezone}</span>
              </div>
              <span className="sched-list__reach">{m.reach.toLocaleString()} recipients</span>
              <button type="button" className="sa-btn sa-btn--danger sa-btn--sm" onClick={() => handleCancel(m.id)} disabled={canceling === m.id}>
                <X size={12} aria-hidden="true" /> {canceling === m.id ? 'Canceling…' : 'Cancel'}
              </button>
            </div>
          ))}
        </div>
      )}

      {history.length > 0 && (
        <>
          <h3 className="sched-list__history-title">History</h3>
          <div className="sched-list__rows">
            {history.map((m) => (
              <div key={m.id} className="sched-list__row sched-list__row--muted">
                <span className={`dr-channel dr-channel--${m.channel}`}>{CHANNEL_ICON[m.channel]}</span>
                <div className="sched-list__body">
                  <strong>{m.subject || m.body.slice(0, 60) || 'Untitled message'}</strong>
                  <span>{fmt(m.sendAtUtc)} · {m.timezone}</span>
                </div>
                <span className={`dr-status dr-status--${m.status === 'sent' ? 'sent' : m.status === 'canceled' ? 'partial' : 'failed'}`}>
                  {STATUS_LABEL[m.status]}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ScheduledMessagesList;
