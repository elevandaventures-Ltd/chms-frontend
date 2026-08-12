'use client';

/**
 * SyncQueueBadge — Day 53 Task 2. Header badge showing the number of
 * pending offline operations; animates while actively syncing; shows a
 * green "All synced" checkmark once the queue is empty.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { CloudOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { getSyncQueueCount, processSyncQueue } from '@/lib/offline-sync';
import { isOnline, subscribeConnectivity } from '@/lib/connectivity';

// A background indicator doesn't need sub-second freshness — reconnects
// already trigger an immediate sync via subscribeConnectivity below, so
// this interval is just a periodic fallback/UI refresh, not the primary
// trigger. Kept well above what would show up as busywork in a profiler.
const POLL_MS = 10_000;

export function SyncQueueBadge() {
  const [count, setCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [everHadItems, setEverHadItems] = useState(false);
  const syncingRef = useRef(false);

  const refreshCount = useCallback(async () => {
    const c = await getSyncQueueCount();
    setCount(c);
    if (c > 0) setEverHadItems(true);
  }, []);

  const trySync = useCallback(async () => {
    if (syncingRef.current || !isOnline()) return;
    const pending = await getSyncQueueCount();
    if (pending === 0) return;

    syncingRef.current = true;
    setSyncing(true);
    try {
      await processSyncQueue();
    } finally {
      syncingRef.current = false;
      setSyncing(false);
      void refreshCount();
    }
  }, [refreshCount]);

  useEffect(() => {
    void refreshCount();
    const poll = setInterval(() => { void refreshCount(); void trySync(); }, POLL_MS);
    const unsubscribe = subscribeConnectivity((online) => { if (online) void trySync(); });
    return () => { clearInterval(poll); unsubscribe(); };
  }, [refreshCount, trySync]);

  if (count === 0 && !everHadItems) return null; // nothing to show until offline use has happened

  return (
    <span
      className={`sync-badge${syncing ? ' sync-badge--syncing' : count > 0 ? ' sync-badge--pending' : ' sync-badge--synced'}`}
      role="status"
      aria-live="polite"
      title={syncing ? 'Syncing offline check-ins…' : count > 0 ? `${count} pending offline operation${count !== 1 ? 's' : ''}` : 'All synced'}
    >
      {syncing ? (
        <RefreshCw size={14} className="sync-badge__spin" aria-hidden="true" />
      ) : count > 0 ? (
        <CloudOff size={14} aria-hidden="true" />
      ) : (
        <CheckCircle2 size={14} aria-hidden="true" />
      )}
      {syncing ? 'Syncing…' : count > 0 ? count : 'All synced'}
    </span>
  );
}

export default SyncQueueBadge;
