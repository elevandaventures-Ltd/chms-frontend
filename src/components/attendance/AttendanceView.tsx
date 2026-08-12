'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, X, RefreshCw, CalendarOff, QrCode } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { SessionCard } from '@/components/attendance/SessionCard';
import { OfflinePageIndicator } from '@/components/OfflinePageIndicator';
import {
  SESSION_TYPES, SESSION_TYPE_LABELS,
  type AttendanceSession, type SessionType,
} from '@/lib/attendance';

export function AttendanceView({ onActiveSession }: { onActiveSession?: (id: string | null) => void }) {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  const [composerOpen, setComposerOpen] = useState(false);
  const [newType,  setNewType]  = useState<SessionType>('sunday_service');
  const [newTitle, setNewTitle] = useState('');
  const [newDate,  setNewDate]  = useState(() => new Date().toISOString().slice(0, 10));
  const [creating, setCreating] = useState(false);
  const [busyId,   setBusyId]   = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/attendance/sessions');
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const json = await res.json();
      setSessions(json.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const active = useMemo(() => sessions.filter((s) => s.status === 'active'), [sessions]);
  const past   = useMemo(() => sessions.filter((s) => s.status === 'ended'), [sessions]);

  async function startSession() {
    setCreating(true);
    setError('');
    try {
      const res = await fetch('/api/attendance/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: newType, title: newTitle.trim() || undefined, date: newDate }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? 'Could not start session.'); return; }
      setSessions((prev) => [json.data as AttendanceSession, ...prev]);
      setComposerOpen(false);
      setNewTitle('');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setCreating(false);
    }
  }

  async function patchSession(session: AttendanceSession, action: 'end' | 'reopen') {
    setBusyId(session.id);
    try {
      const res = await fetch(`/api/attendance/sessions/${session.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? 'Could not update session.'); return; }
      setSessions((prev) => prev.map((s) =>
        s.id === session.id
          ? { ...s, status: json.status, endedAt: json.endedAt ?? undefined }
          : s,
      ));
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="att-view">
      {/* Header */}
      <div className="att-view__head">
        <div>
          <h1 className="att-view__title">Attendance</h1>
          <p className="att-view__sub">Start a session and track who&apos;s in the room.</p>
          <OfflinePageIndicator label="Offline — check-ins will queue and sync automatically" />
        </div>
        <div className="att-view__head-actions">
          <Link href="/attendance/scan" className="att-scan-link">
            <QrCode size={16} aria-hidden="true" />
            Scan QR
          </Link>
          <button
            type="button"
            className="att-start-btn"
            onClick={() => setComposerOpen((v) => !v)}
            aria-expanded={composerOpen}
          >
            <Plus size={16} aria-hidden="true" />
            Start New Session
          </button>
        </div>
      </div>

      {/* New session composer */}
      {composerOpen && (
        <div className="att-composer" role="group" aria-label="New session">
          <div className="att-composer__head">
            <h2>New session</h2>
            <button type="button" className="msm-close" onClick={() => setComposerOpen(false)} aria-label="Close">
              <X size={16} />
            </button>
          </div>

          <div className="att-composer__field">
            <span className="att-composer__label">Session type</span>
            <div className="att-type-grid" role="radiogroup" aria-label="Session type">
              {SESSION_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={newType === t ? 'true' : 'false'}
                  className={`att-type${newType === t ? ' att-type--active' : ''}`}
                  onClick={() => setNewType(t)}
                >
                  {SESSION_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <div className="att-composer__row">
            <label className="att-composer__field">
              <span className="att-composer__label">Title (optional)</span>
              <input
                className="amf-input"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. First Service"
                maxLength={120}
              />
            </label>
            <label className="att-composer__field">
              <span className="att-composer__label">Date</span>
              <input
                type="date"
                className="amf-input"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </label>
          </div>

          <div className="att-composer__actions">
            <button type="button" className="msm-btn msm-btn--secondary" onClick={() => setComposerOpen(false)} disabled={creating}>
              Cancel
            </button>
            <button type="button" className="msm-btn msm-btn--primary" onClick={startSession} disabled={creating}>
              {creating ? 'Starting…' : 'Start Session'}
            </button>
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive" title="Something went wrong" onClose={() => setError('')}>
          {error}{' '}
          <button type="button" className="member-dir__retry-btn" onClick={() => void load()}>
            <RefreshCw size={13} aria-hidden="true" /> Retry
          </button>
        </Alert>
      )}

      {/* Active sessions */}
      <section className="att-section">
        <h2 className="att-section__title">
          Active Sessions
          {!loading && <span className="att-section__count">{active.length}</span>}
        </h2>
        {loading ? (
          <div className="att-grid">
            {Array.from({ length: 2 }).map((_, i) => <div key={i} className="att-card att-card--skeleton" />)}
          </div>
        ) : active.length > 0 ? (
          <div className="att-grid">
            {active.map((s) => (
              <SessionCard key={s.id} session={s} busy={busyId === s.id} onEnd={(x) => patchSession(x, 'end')} />
            ))}
          </div>
        ) : (
          <div className="att-empty" role="status">
            <CalendarOff size={28} strokeWidth={1.5} aria-hidden="true" />
            <p>No active sessions. Start one to begin tracking attendance.</p>
          </div>
        )}
      </section>

      {/* Past sessions */}
      {!loading && past.length > 0 && (
        <section className="att-section">
          <h2 className="att-section__title">
            Recent Sessions
            <span className="att-section__count">{past.length}</span>
          </h2>
          <div className="att-grid">
            {past.map((s) => (
              <SessionCard
                key={s.id}
                session={s}
                busy={busyId === s.id}
                onEnd={(x) => patchSession(x, 'end')}
                onReopen={(x) => patchSession(x, 'reopen')}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default AttendanceView;
