'use client';

/**
 * OfflinePageIndicator — Day 54 Task 2. Small inline indicator for pages
 * that need live data (dashboard, attendance, communication) — shown
 * next to the page title so it's clear the numbers on screen may be
 * stale while offline, without repeating the full-page banner's copy.
 */
import { CloudOff } from 'lucide-react';
import { useConnectivity } from '@/hooks/useConnectivity';

export function OfflinePageIndicator({ label = 'Showing cached data' }: { label?: string }) {
  const { online } = useConnectivity();
  if (online) return null;

  return (
    <span className="offline-page-indicator">
      <CloudOff size={12} aria-hidden="true" /> {label}
    </span>
  );
}

export default OfflinePageIndicator;
