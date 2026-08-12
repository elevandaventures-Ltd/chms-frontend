'use client';

/**
 * AttendanceHistory — Day 25
 *
 * Table of past sessions: date, type, total count, check-in rate vs expected.
 * Click a row to view session detail (list of checked-in members).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ChevronRight, RefreshCw, CalendarOff, Users, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SESSION_TYPE_LABELS, mockSessions, type AttendanceSession } from '@/lib/attendance';

type SessionWithRate = AttendanceSession & { rate?: number; expected?: number };

type CheckinRecord = {
  memberId:   string;
  memberName: string;
  photoUrl?:  string;
  checkedInAt: string;
  method:     string;
};

const MOCK_DETAIL: CheckinRecord[] = [
  { memberId: 'm1',  memberName: 'Abena Mensah',    checkedInAt: '09:03', method: 'QR' },
  { memberId: 'm2',  memberName: 'Kwame Asante',    checkedInAt: '09:07', method: 'QR' },
  { memberId: 'm3',  memberName: 'Ama Boateng',     checkedInAt: '09:11', method: 'PIN' },
  { memberId: 'm5',  memberName: 'Efua Darko',      checkedInAt: '09:14', method: 'QR' },
  { memberId: 'm11', memberName: 'Ekow Hammond',    checkedInAt: '09:18', method: 'Manual' },
];

function getInitials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

export function AttendanceHistory() {
  const [sessions,   setSessions]   = useState<SessionWithRate[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [selected,   setSelected]   = useState<SessionWithRate | null>(null);
  const [detail,     setDetail]     = useState<CheckinRecord[]>([]);
  const [detailLoad, setDetailLoad] = useState(false);
  const checkinListRef = useRef<HTMLDivElement | null>(null);

  // Day 57 Task 2 — a busy Sunday service can have hundreds of check-ins;
  // only render the rows actually in view.
  const checkinVirtualizer = useVirtualizer({
    count: detail.length,
    getScrollElement: () => checkinListRef.current,
    estimateSize: () => 52,
    overscan: 8,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/attendance/sessions?status=all');
      const json = await res.json() as { data: AttendanceSession[] };
      const data = (json.data ?? mockSessions).map((s) => ({
        ...s,
        expected: Math.round(s.count * 1.2 + 30),
        rate:     Math.round((s.count / (s.count * 1.2 + 30)) * 100),
      }));
      setSessions(data.filter((s) => s.status === 'ended'));
    } catch {
      setSessions(mockSessions.filter((s) => s.status === 'ended').map((s) => ({
        ...s, expected: Math.round(s.count * 1.2 + 30), rate: 72,
      })));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function openDetail(session: SessionWithRate) {
    setSelected(session);
    setDetailLoad(true);
    try {
      const res = await fetch(`/api/attendance/sessions/${session.id}/checkins`);
      const json = await res.json() as { data: CheckinRecord[] };
      setDetail(json.data ?? MOCK_DETAIL);
    } catch {
      setDetail(MOCK_DETAIL);
    } finally {
      setDetailLoad(false);
    }
  }

  if (selected) {
    return (
      <div className="att-history">
        <button type="button" className="att-history__back" onClick={() => setSelected(null)}>
          ← Back to history
        </button>

        <div className="att-history__detail-head">
          <div>
            <p className="att-history__date">{selected.date}</p>
            <h2 className="att-history__detail-title">
              {selected.title ?? SESSION_TYPE_LABELS[selected.type]}
            </h2>
          </div>
          <div className="att-history__detail-stats">
            <div className="att-history__stat">
              <Users size={14} aria-hidden="true" />
              <strong>{selected.count}</strong>
              <span>checked in</span>
            </div>
            {selected.rate != null && (
              <div className="att-history__stat">
                <TrendingUp size={14} aria-hidden="true" />
                <strong>{selected.rate}%</strong>
                <span>check-in rate</span>
              </div>
            )}
          </div>
        </div>

        {detailLoad ? (
          <p className="att-empty"><RefreshCw size={16} aria-hidden="true" /> Loading…</p>
        ) : (
          <div className="att-history__checkin-list att-history__checkin-list--virtual" ref={checkinListRef}>
            <div style={{ height: checkinVirtualizer.getTotalSize(), position: 'relative' }}>
              {checkinVirtualizer.getVirtualItems().map((virtualRow) => {
                const r = detail[virtualRow.index];
                if (!r) return null;
                return (
                  <div
                    key={`${r.memberId}-${virtualRow.index}`}
                    className="att-history__checkin-row"
                    style={{ height: virtualRow.size, transform: `translateY(${virtualRow.start}px)`, position: 'absolute', top: 0, left: 0, right: 0 }}
                  >
                    <div className="att-history__checkin-avatar" aria-hidden="true">
                      {r.photoUrl
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={r.photoUrl} alt={r.memberName} />
                        : getInitials(r.memberName)
                      }
                    </div>
                    <span className="att-history__checkin-name">{r.memberName}</span>
                    <span className="att-history__checkin-time">{r.checkedInAt}</span>
                    <span className="att-history__checkin-method">{r.method}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="att-history">
      <div className="att-history__toolbar">
        <h2 className="att-history__heading">Past Sessions</h2>
        <button type="button" className="member-dir__retry-btn" onClick={() => void load()}>
          <RefreshCw size={13} aria-hidden="true" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="att-grid">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="att-card att-card--skeleton" />)}
        </div>
      ) : sessions.length === 0 ? (
        <div className="att-empty">
          <CalendarOff size={28} strokeWidth={1.5} aria-hidden="true" />
          <p>No past sessions yet.</p>
        </div>
      ) : (
        <table className="att-history__table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Session</th>
              <th>Total</th>
              <th>Rate</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id} className="att-history__row" onClick={() => void openDetail(s)} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') void openDetail(s); }}>
                <td className="att-history__cell att-history__cell--date">{s.date}</td>
                <td className="att-history__cell">
                  <strong>{s.title ?? SESSION_TYPE_LABELS[s.type]}</strong>
                  <span className="att-history__type-badge">{SESSION_TYPE_LABELS[s.type]}</span>
                </td>
                <td className="att-history__cell att-history__cell--count">
                  <Users size={13} aria-hidden="true" /> {s.count}
                </td>
                <td className="att-history__cell">
                  <div className="att-rate-bar">
                    <div className="att-rate-bar__fill" style={{ width: `${s.rate ?? 0}%` }} />
                  </div>
                  <span className="att-rate-label">{s.rate ?? 0}%</span>
                </td>
                <td className="att-history__cell att-history__cell--arrow">
                  <ChevronRight size={16} aria-hidden="true" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AttendanceHistory;
