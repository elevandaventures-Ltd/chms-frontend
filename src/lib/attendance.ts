/**
 * Attendance domain types, labels, and mock test data (Day 21).
 *
 * Sessions represent a gathering (Sunday service, midweek, etc.) that can be
 * active (in progress, accepting check-ins) or ended.
 */

export type SessionType = 'sunday_service' | 'midweek' | 'sunday_school' | 'special_event';
export type SessionStatus = 'active' | 'ended';

export const SESSION_TYPES: SessionType[] = [
  'sunday_service', 'midweek', 'sunday_school', 'special_event',
];

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  sunday_service: 'Sunday Service',
  midweek:        'Midweek',
  sunday_school:  'Sunday School',
  special_event:  'Special Event',
};

export type AttendanceSession = {
  id: string;
  type: SessionType;
  title?: string;        // optional custom label, e.g. "Watchnight Service"
  status: SessionStatus;
  date: string;          // ISO date YYYY-MM-DD
  startedAt: string;     // ISO datetime
  endedAt?: string;      // ISO datetime when ended
  count: number;         // head count / check-ins
};

// ── Mock test data — used by GET /api/attendance/sessions in dev ────────────────

export const mockSessions: AttendanceSession[] = [
  {
    id: 'sess-1',
    type: 'sunday_service',
    title: 'Sunday First Service',
    status: 'active',
    date: '2026-06-21',
    startedAt: '2026-06-21T08:00:00.000Z',
    count: 142,
  },
  {
    id: 'sess-2',
    type: 'sunday_school',
    status: 'active',
    date: '2026-06-21',
    startedAt: '2026-06-21T09:45:00.000Z',
    count: 38,
  },
  {
    id: 'sess-3',
    type: 'midweek',
    title: 'Wednesday Bible Study',
    status: 'ended',
    date: '2026-06-17',
    startedAt: '2026-06-17T18:00:00.000Z',
    endedAt: '2026-06-17T19:30:00.000Z',
    count: 76,
  },
  {
    id: 'sess-4',
    type: 'special_event',
    title: 'Youth Conference',
    status: 'ended',
    date: '2026-06-14',
    startedAt: '2026-06-14T16:00:00.000Z',
    endedAt: '2026-06-14T20:00:00.000Z',
    count: 210,
  },
];
