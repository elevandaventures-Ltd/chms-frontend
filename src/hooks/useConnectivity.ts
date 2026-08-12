'use client';

/**
 * useConnectivity — Day 54. React binding over lib/connectivity's
 * online/offline pub-sub. `justReconnected` stays true for 2s after an
 * offline→online transition so the banner can show a brief "Back online"
 * state before disappearing, per the Day 54 review.
 */
import { useEffect, useState } from 'react';
import { isOnline, startConnectivityMonitor, subscribeConnectivity } from '@/lib/connectivity';

const RECONNECT_DISPLAY_MS = 2000;

export function useConnectivity(): { online: boolean; justReconnected: boolean } {
  const [online, setOnlineState] = useState(true);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    startConnectivityMonitor();
    setOnlineState(isOnline());

    let wasOffline = !isOnline();
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const unsubscribe = subscribeConnectivity((next) => {
      setOnlineState(next);
      if (next && wasOffline) {
        setJustReconnected(true);
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => setJustReconnected(false), RECONNECT_DISPLAY_MS);
      }
      wasOffline = !next;
    });

    return () => {
      unsubscribe();
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  return { online, justReconnected };
}
