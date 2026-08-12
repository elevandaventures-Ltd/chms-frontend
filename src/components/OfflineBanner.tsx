'use client';

/**
 * OfflineBanner — Day 54 Task 2. Full-width "You are offline" banner;
 * flips to a brief green "Back online" state for 2s after reconnecting,
 * then disappears.
 */
import { WifiOff, Wifi } from 'lucide-react';
import { useConnectivity } from '@/hooks/useConnectivity';

export function OfflineBanner() {
  const { online, justReconnected } = useConnectivity();
  const visible = !online || justReconnected;

  // Always mounted (never `return null`) so showing/hiding it animates via
  // the max-height/opacity transition below instead of an instant DOM
  // insert/remove — the latter is what reads as the page "jumping".
  return (
    <div
      className={`offline-banner${visible ? ' offline-banner--visible' : ''}${online ? ' offline-banner--back' : ''}`}
      role="status"
      aria-live="assertive"
      aria-hidden={!visible}
    >
      <div className="offline-banner__inner">
        {online ? (
          <><Wifi size={14} aria-hidden="true" /> Back online — syncing…</>
        ) : (
          <><WifiOff size={14} aria-hidden="true" /> You are offline — changes will sync automatically when you reconnect.</>
        )}
      </div>
    </div>
  );
}

export default OfflineBanner;
