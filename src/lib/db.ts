/**
 * db.ts — Day 52: local-first IndexedDB via Dexie, mirroring the server
 * tables that matter offline (members, events, attendance_sessions,
 * message drafts, and the sync queue for offline writes).
 */
import Dexie, { type EntityTable } from 'dexie';

export type LocalMember = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  status: string;
  role: string;
  ministries: string[];
  joinedDate: string;
  photoUrl?: string;
};

export type LocalEvent = {
  id: string;
  title: string;
  type: string;
  start: string; // ISO
  end: string;   // ISO
  location?: string;
  rsvpCount?: number;
};

export type LocalAttendanceSession = {
  id: string;
  sessionType: string;
  startedAt: string;
  status: string;
  checkinCount: number;
};

export type MessageDraft = {
  id?: number;
  channel: string;
  subject?: string;
  body: string;
  savedAt: string;
};

export type SyncQueueOperationType = 'checkin' | 'member_update' | 'message_draft';

export type SyncQueueItem = {
  id?: number;
  type: SyncQueueOperationType;
  payload: Record<string, unknown>;
  createdAt: string;
  status: 'pending' | 'syncing' | 'failed';
  attempts: number;
  label: string; // human-readable, for the sync queue indicator
};

class ElevandaDB extends Dexie {
  members!: EntityTable<LocalMember, 'id'>;
  events!: EntityTable<LocalEvent, 'id'>;
  attendanceSessions!: EntityTable<LocalAttendanceSession, 'id'>;
  messageDrafts!: EntityTable<MessageDraft, 'id'>;
  syncQueue!: EntityTable<SyncQueueItem, 'id'>;

  constructor() {
    super('elevanda-chms');
    this.version(1).stores({
      members: 'id, status, fullName',
      events: 'id, start',
      attendanceSessions: 'id, startedAt, status',
      messageDrafts: '++id, channel, savedAt',
      syncQueue: '++id, type, status, createdAt',
    });
  }
}

/**
 * Dexie touches indexedDB at construction time — guard for SSR (no IDB in
 * Node) and for browsers where IndexedDB exists but is unusable (Safari
 * private-mode throws synchronously on open rather than just failing a
 * query; some older/locked-down Firefox profiles behave similarly).
 * Every caller already treats `db` as possibly null (offline-sync.ts,
 * QRScanner.tsx), so the app degrades to "offline features unavailable"
 * instead of a hard crash — see Day 55.
 */
function createDb(): ElevandaDB | null {
  if (typeof window === 'undefined' || !('indexedDB' in window)) return null;
  try {
    return new ElevandaDB();
  } catch (err) {
    console.warn('[db] IndexedDB unavailable (private browsing / blocked storage?) — offline features disabled:', err);
    return null;
  }
}

export const db: ElevandaDB | null = createDb();
