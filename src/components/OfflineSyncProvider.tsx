'use client';

/**
 * OfflineSyncProvider — Day 52 Task 2. Runs the initial members/events/
 * attendance-sessions sync into IndexedDB once per browser session after
 * login, and shows an "Offline data ready" toast when it completes.
 */
import { useEffect } from 'react';
import { toast } from 'sonner';
import { hasRunInitialSync, runInitialSync } from '@/lib/offline-sync';

export function OfflineSyncProvider() {
  useEffect(() => {
    if (hasRunInitialSync()) return;

    // Defer until the browser is idle (or ~2s worst case) so this doesn't
    // compete with the page the user actually navigated to for network/
    // main-thread time right after the first load of a session.
    const run = () => {
      void runInitialSync().then((result) => {
        if (!result) return;
        toast.success('Offline data ready', {
          description: `${result.members} members, ${result.events} events, and ${result.sessions} attendance sessions are available offline.`,
        });
      });
    };

    const ric = window.requestIdleCallback as typeof window.requestIdleCallback | undefined;
    if (ric) {
      const id = ric(run, { timeout: 2000 });
      return () => window.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(run, 1500);
    return () => window.clearTimeout(id);
  }, []);

  return null;
}

export default OfflineSyncProvider;
