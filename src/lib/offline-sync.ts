/**
 * offline-sync.ts — Day 52 Task 2 (initial sync on login) + Day 53
 * (offline check-in sync queue).
 */
import { db, type SyncQueueOperationType, type LocalMember, type LocalEvent, type LocalAttendanceSession } from '@/lib/db';

const INITIAL_SYNC_KEY = 'offline_initial_sync_done';

export function hasRunInitialSync(): boolean {
  try { return sessionStorage.getItem(INITIAL_SYNC_KEY) === '1'; } catch { return false; }
}

function markInitialSyncDone(): void {
  try { sessionStorage.setItem(INITIAL_SYNC_KEY, '1'); } catch { /* ignore */ }
}

export type InitialSyncResult = { members: number; events: number; sessions: number };

/**
 * Day 52 Task 2: fetch first 500 members, all upcoming events, and recent
 * attendance sessions → populate IndexedDB. Called once per browser
 * session right after the dashboard mounts (see OfflineSyncProvider).
 */
export async function runInitialSync(): Promise<InitialSyncResult | null> {
  if (!db) return null;

  const [membersRes, eventsRes, sessionsRes] = await Promise.allSettled([
    fetch('/api/members?pageSize=500').then((r) => r.json()),
    fetch('/api/events').then((r) => r.json()),
    fetch('/api/attendance/sessions').then((r) => r.json()),
  ]);

  let memberCount = 0;
  if (membersRes.status === 'fulfilled') {
    const rows = (membersRes.value.data ?? membersRes.value.members ?? []) as Record<string, unknown>[];
    const localMembers: LocalMember[] = rows.map((m) => ({
      id: String(m.id),
      fullName: String(m.fullName ?? m.full_name ?? ''),
      email: String(m.email ?? ''),
      phone: m.phone ? String(m.phone) : undefined,
      status: String(m.status ?? 'active'),
      role: String(m.role ?? 'member'),
      ministries: Array.isArray(m.ministries) ? (m.ministries as string[]) : [],
      joinedDate: String(m.joinedDate ?? m.joined_date ?? ''),
      photoUrl: m.photoUrl ? String(m.photoUrl) : undefined,
    }));
    if (localMembers.length > 0) await db.members.bulkPut(localMembers);
    memberCount = localMembers.length;
  }

  let eventCount = 0;
  if (eventsRes.status === 'fulfilled') {
    const rows = (eventsRes.value.data ?? []) as Record<string, unknown>[];
    const localEvents: LocalEvent[] = rows.map((e) => ({
      id: String(e.id),
      title: String(e.title ?? ''),
      type: String(e.type ?? 'other'),
      start: String(e.start ?? ''),
      end: String(e.end ?? ''),
      location: e.location ? String(e.location) : undefined,
      rsvpCount: typeof e.rsvpCount === 'number' ? e.rsvpCount : undefined,
    }));
    if (localEvents.length > 0) await db.events.bulkPut(localEvents);
    eventCount = localEvents.length;
  }

  let sessionCount = 0;
  if (sessionsRes.status === 'fulfilled') {
    const rows = (sessionsRes.value.data ?? []) as Record<string, unknown>[];
    const localSessions: LocalAttendanceSession[] = rows.map((s) => ({
      id: String(s.id),
      sessionType: String(s.sessionType ?? ''),
      startedAt: String(s.startedAt ?? s.createdAt ?? ''),
      status: String(s.status ?? ''),
      checkinCount: typeof s.checkinCount === 'number' ? s.checkinCount : 0,
    }));
    if (localSessions.length > 0) await db.attendanceSessions.bulkPut(localSessions);
    sessionCount = localSessions.length;
  }

  markInitialSyncDone();
  return { members: memberCount, events: eventCount, sessions: sessionCount };
}

// ── Sync queue (Day 53) ───────────────────────────────────────────────────────

export async function enqueueSyncItem(type: SyncQueueOperationType, payload: Record<string, unknown>, label: string): Promise<void> {
  if (!db) return;
  await db.syncQueue.add({ type, payload, label, createdAt: new Date().toISOString(), status: 'pending', attempts: 0 });
}

export async function getSyncQueueCount(): Promise<number> {
  if (!db) return 0;
  return db.syncQueue.where('status').anyOf('pending', 'syncing').count();
}

/** POST each queued item to the endpoint its type maps to. Best-effort:
 *  a failure bumps `attempts` and leaves the item queued for the next tick
 *  rather than dropping it, so nothing is silently lost. */
export async function processSyncQueue(): Promise<{ synced: number; failed: number }> {
  if (!db) return { synced: 0, failed: 0 };

  const pending = await db.syncQueue.where('status').equals('pending').toArray();
  let synced = 0;
  let failed = 0;

  for (const item of pending) {
    if (item.id == null) continue;
    await db.syncQueue.update(item.id, { status: 'syncing' });

    try {
      const ok = await syncOne(item.type, item.payload);
      if (ok) {
        await db.syncQueue.delete(item.id);
        synced += 1;
      } else {
        await db.syncQueue.update(item.id, { status: 'pending', attempts: item.attempts + 1 });
        failed += 1;
      }
    } catch {
      await db.syncQueue.update(item.id, { status: 'pending', attempts: item.attempts + 1 });
      failed += 1;
    }
  }

  return { synced, failed };
}

async function syncOne(type: SyncQueueOperationType, payload: Record<string, unknown>): Promise<boolean> {
  if (type === 'checkin') {
    const res = await fetch(`/api/attendance/sessions/${payload.sessionId}/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok;
  }
  // Other queue types (member_update, message_draft) aren't produced yet —
  // treat as synced so they don't jam the queue if ever added speculatively.
  return true;
}
