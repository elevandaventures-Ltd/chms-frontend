'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, RefreshCw } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { QRScanner } from '@/components/attendance/QRScanner';
import { SESSION_TYPE_LABELS, type AttendanceSession } from '@/lib/attendance';

export function ScanView() {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [activeId, setActiveId] = useState('');
  const [count,    setCount]    = useState<number | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/attendance/sessions?status=active');
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const json = await res.json();
      const data: AttendanceSession[] = json.data ?? [];
      setSessions(data);
      if (data.length > 0) {
        setActiveId((prev) => (prev && data.some((s) => s.id === prev) ? prev : data[0].id));
        const current = data.find((s) => s.id === (activeId || data[0].id));
        setCount(current?.count ?? null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); /* eslint-disable-next-line */ }, []);

  const activeSession = sessions.find((s) => s.id === activeId) ?? null;

  return (
    <div className="scan-view">
      <div className="scan-view__head">
        <Link href="/attendance" className="scan-view__back">
          <ArrowLeft size={16} aria-hidden="true" /> Attendance
        </Link>
        <h1 className="scan-view__title">Scan to Check In</h1>
      </div>

      {error && (
        <Alert variant="destructive" title="Could not load sessions" onClose={() => setError('')}>
          {error}{' '}
          <button type="button" className="member-dir__retry-btn" onClick={() => void load()}>
            <RefreshCw size={13} aria-hidden="true" /> Retry
          </button>
        </Alert>
      )}

      {!loading && sessions.length === 0 && !error && (
        <div className="att-empty" role="status">
          <p>No active session. Start one before scanning.</p>
          <Link href="/attendance" className="msm-btn msm-btn--primary">Go to Attendance</Link>
        </div>
      )}

      {activeSession && (
        <>
          {/* Target session + live count */}
          <div className="scan-view__session">
            <div className="scan-view__session-field">
              <label htmlFor="scan-session" className="att-composer__label">Checking in to</label>
              {sessions.length > 1 ? (
                <select
                  id="scan-session"
                  className="amf-select"
                  value={activeId}
                  onChange={(e) => {
                    setActiveId(e.target.value);
                    setCount(sessions.find((s) => s.id === e.target.value)?.count ?? null);
                  }}
                >
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {SESSION_TYPE_LABELS[s.type]}{s.title ? ` · ${s.title}` : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="scan-view__session-name">
                  {SESSION_TYPE_LABELS[activeSession.type]}{activeSession.title ? ` · ${activeSession.title}` : ''}
                </p>
              )}
            </div>
            <span className="scan-view__count">
              <Users size={16} aria-hidden="true" />
              <strong>{count ?? activeSession.count}</strong>
              <span>checked in</span>
            </span>
          </div>

          {/* Scanner — remount per session so the camera loop targets the right id */}
          <QRScanner
            key={activeSession.id}
            sessionId={activeSession.id}
            onCheckedIn={(c) => setCount((prev) => (c ?? (prev == null ? null : prev + 1)))}
          />
        </>
      )}
    </div>
  );
}

export default ScanView;
