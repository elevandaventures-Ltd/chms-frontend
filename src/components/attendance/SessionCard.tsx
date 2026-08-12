'use client';

import { CalendarDays, Users, Clock, Play, Square } from 'lucide-react';
import {
  SESSION_TYPE_LABELS,
  type AttendanceSession,
  type SessionType,
} from '@/lib/attendance';

// Accent colour per session type.
const TYPE_ACCENT: Record<SessionType, string> = {
  sunday_service: '#b25131',
  midweek:        '#2563eb',
  sunday_school:  '#7c3aed',
  special_event:  '#16a34a',
};

function formatDate(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  return new Date(t).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(iso?: string): string {
  if (!iso) return '';
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return '';
  return new Date(t).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

type SessionCardProps = {
  session: AttendanceSession;
  onEnd:   (session: AttendanceSession) => void;
  onReopen?: (session: AttendanceSession) => void;
  busy?: boolean;
};

export function SessionCard({ session, onEnd, onReopen, busy }: SessionCardProps) {
  const { type, title, status, date, startedAt, endedAt, count } = session;
  const accent = TYPE_ACCENT[type];
  const isActive = status === 'active';

  return (
    <article className={`att-card${isActive ? ' att-card--active' : ''}`}>
      <span className="att-card__stripe" style={{ background: accent }} aria-hidden="true" />

      <header className="att-card__head">
        <div>
          <h3 className="att-card__type">{SESSION_TYPE_LABELS[type]}</h3>
          {title && <p className="att-card__title">{title}</p>}
        </div>
        <span className={`att-card__status att-card__status--${status}`}>
          {isActive ? 'Live' : 'Ended'}
        </span>
      </header>

      <div className="att-card__meta">
        <span><CalendarDays size={13} aria-hidden="true" /> {formatDate(date)}</span>
        <span>
          <Clock size={13} aria-hidden="true" />
          {formatTime(startedAt)}{endedAt ? ` – ${formatTime(endedAt)}` : ''}
        </span>
      </div>

      <div className="att-card__footer">
        {/* Live count badge */}
        <span className={`att-count${isActive ? ' att-count--live' : ''}`}>
          {isActive && <span className="att-count__pulse" aria-hidden="true" />}
          <Users size={14} aria-hidden="true" />
          <strong>{count}</strong>
          <span className="att-count__label">checked in</span>
        </span>

        {/* Start / End session button */}
        {isActive ? (
          <button
            type="button"
            className="att-btn att-btn--end"
            onClick={() => onEnd(session)}
            disabled={busy}
          >
            <Square size={14} aria-hidden="true" /> End Session
          </button>
        ) : onReopen ? (
          <button
            type="button"
            className="att-btn att-btn--reopen"
            onClick={() => onReopen(session)}
            disabled={busy}
          >
            <Play size={14} aria-hidden="true" /> Reopen
          </button>
        ) : null}
      </div>
    </article>
  );
}

export default SessionCard;
