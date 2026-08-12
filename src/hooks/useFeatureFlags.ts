'use client';

/**
 * useFeatureFlags — Day 44. Which platform feature flags are enabled for
 * the current church. Backs sidebar gating and per-page "this feature is
 * disabled" screens when a superadmin turns a flag off.
 */
import { useEffect, useState } from 'react';

export function useFeatureFlags(): { enabled: Set<string>; loading: boolean } {
  const [enabled, setEnabled] = useState<Set<string> | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/church/feature-flags')
      .then((r) => r.json())
      .then((json: { enabled?: string[] }) => { if (!cancelled) setEnabled(new Set(json.enabled ?? [])); })
      .catch(() => { if (!cancelled) setEnabled(new Set()); });
    return () => { cancelled = true; };
  }, []);

  return { enabled: enabled ?? new Set(), loading: enabled === null };
}

export function useFeatureFlag(key: string): { enabled: boolean; loading: boolean } {
  const { enabled, loading } = useFeatureFlags();
  // While loading, assume enabled so pages don't flash a "disabled" state
  // for churches that have every flag on (the common case).
  return { enabled: loading ? true : enabled.has(key), loading };
}
