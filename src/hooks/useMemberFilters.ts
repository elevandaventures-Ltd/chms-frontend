'use client';

/**
 * useMemberFilters — Day 14
 *
 * Manages the full filter state for the Member Directory.
 * Exposes a typed filter object, update helpers, active count,
 * and a clearAll action.
 *
 * All filters combine with the Meilisearch search query.
 */
import { useCallback, useMemo, useState } from 'react';
import type { MemberStatus, AgeGroup } from '@/lib/site';

// ── Constants exposed to the filter bar ──────────────────────────────────────

export const ALL_MINISTRIES = [
  'Worship', 'Prayer', 'Youth', 'Evangelism', 'Children', 'Admin',
  "Women's Ministry", "Men's Ministry", 'Finance', 'Ushering', 'Hospitality',
  'Choir', 'Leadership', 'Sunday School', 'Media', 'Tech',
  'Intercession', 'Stewardship',
];

export const ALL_ZONES = ['North', 'South', 'East', 'West', 'Central'];

export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  child:       'Child (0–12)',
  youth:       'Youth (13–24)',
  young_adult: 'Young Adult (25–35)',
  adult:       'Adult (36–59)',
  senior:      'Senior (60+)',
};

export const ALL_AGE_GROUPS: AgeGroup[] = [
  'child', 'youth', 'young_adult', 'adult', 'senior',
];

// ── Filter state type ─────────────────────────────────────────────────────────

export type MemberFilterState = {
  statuses:    MemberStatus[];   // multi-select
  ministries:  string[];         // multi-select dropdown
  ageGroups:   AgeGroup[];       // multi-select range
  joinDateFrom: string;          // YYYY-MM-DD or ''
  joinDateTo:   string;          // YYYY-MM-DD or ''
  zones:        string[];        // multi-select
};

const DEFAULT_FILTERS: MemberFilterState = {
  statuses:     [],
  ministries:   [],
  ageGroups:    [],
  joinDateFrom: '',
  joinDateTo:   '',
  zones:        [],
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useMemberFilters() {
  const [filters, setFilters] = useState<MemberFilterState>(DEFAULT_FILTERS);

  /** Number of active (non-default) filters — shown as a badge. */
  const activeCount = useMemo(() => {
    let n = 0;
    if (filters.statuses.length)    n++;
    if (filters.ministries.length)  n++;
    if (filters.ageGroups.length)   n++;
    if (filters.joinDateFrom || filters.joinDateTo) n++;
    if (filters.zones.length)       n++;
    return n;
  }, [filters]);

  const isActive = activeCount > 0;

  const patch = useCallback(<K extends keyof MemberFilterState>(
    key: K,
    value: MemberFilterState[K],
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  /** Toggle a single value in a string[] filter (multi-select). */
  const toggle = useCallback(<K extends keyof MemberFilterState>(
    key: K,
    value: string,
  ) => {
    setFilters((prev) => {
      const arr = prev[key] as string[];
      const next = arr.includes(value)
        ? arr.filter((v) => v !== value)
        : [...arr, value];
      return { ...prev, [key]: next };
    });
  }, []);

  const clearAll = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  /** Build URLSearchParams from current filter state for the API call. */
  const toParams = useCallback((base: URLSearchParams = new URLSearchParams()) => {
    if (filters.statuses.length === 1) base.set('status', filters.statuses[0]);
    if (filters.ministries.length)    base.set('ministries', filters.ministries.join(','));
    if (filters.ageGroups.length)     base.set('ageGroups',  filters.ageGroups.join(','));
    if (filters.joinDateFrom)         base.set('joinFrom',   filters.joinDateFrom);
    if (filters.joinDateTo)           base.set('joinTo',     filters.joinDateTo);
    if (filters.zones.length)         base.set('zones',      filters.zones.join(','));
    return base;
  }, [filters]);

  return { filters, patch, toggle, clearAll, activeCount, isActive, toParams };
}
