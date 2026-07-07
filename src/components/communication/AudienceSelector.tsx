'use client';

/**
 * AudienceSelector — Day 31
 * Filter audience by ministry, age group, status, and geographic zone.
 * Reach count is computed by the parent and passed in as a prop.
 */
import { useState } from 'react';
import { Users, ChevronDown, ChevronUp } from 'lucide-react';
import { MINISTRIES } from '@/lib/ministries';
import type { AgeGroup, MemberStatus } from '@/lib/site';

export type AudienceFilters = {
  statuses:   MemberStatus[];
  ministries: string[];
  ageGroups:  AgeGroup[];
  zones:      string[];
};

export const EMPTY_FILTERS: AudienceFilters = {
  statuses: [], ministries: [], ageGroups: [], zones: [],
};

const STATUSES: { value: MemberStatus; label: string }[] = [
  { value: 'active',   label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'visitor',  label: 'Visitor' },
];

const AGE_GROUPS: { value: AgeGroup; label: string }[] = [
  { value: 'child',       label: 'Child' },
  { value: 'youth',       label: 'Youth' },
  { value: 'young_adult', label: 'Young Adult' },
  { value: 'adult',       label: 'Adult' },
  { value: 'senior',      label: 'Senior' },
];

const ZONES = ['North', 'South', 'East', 'West', 'Central'];

type Props = {
  filters:  AudienceFilters;
  onChange: (f: AudienceFilters) => void;
  channel:  string;
  reach:    number;
};

function toggle<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
}

export function AudienceSelector({ filters, onChange, reach }: Props) {
  const [open, setOpen] = useState(true);

  const set = (patch: Partial<AudienceFilters>) => onChange({ ...filters, ...patch });

  const activeCount =
    filters.statuses.length + filters.ministries.length +
    filters.ageGroups.length + filters.zones.length;

  return (
    <div className="comm-audience">
      <div className="comm-audience__header">
        <button
          type="button"
          className="comm-audience__toggle"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          <Users size={15} aria-hidden="true" />
          <span>Audience</span>
          {activeCount > 0 && <span className="comm-audience__badge">{activeCount}</span>}
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        <p className="comm-audience__reach" aria-live="polite">
          Estimated reach: <strong>{reach.toLocaleString()}</strong> member{reach !== 1 ? 's' : ''}
        </p>

        {activeCount > 0 && (
          <button type="button" className="comm-audience__clear" onClick={() => onChange(EMPTY_FILTERS)}>
            Clear all
          </button>
        )}
      </div>

      {open && (
        <div className="comm-audience__panel">
          <div className="comm-audience__group">
            <p className="comm-audience__group-label">Status</p>
            <div className="comm-audience__pills">
              {STATUSES.map(({ value, label }) => (
                <button
                  key={value} type="button"
                  className={`comm-pill${filters.statuses.includes(value) ? ' comm-pill--active' : ''}`}
                  onClick={() => set({ statuses: toggle(filters.statuses, value) })}
                >{label}</button>
              ))}
            </div>
          </div>

          <div className="comm-audience__group">
            <p className="comm-audience__group-label">Ministry</p>
            <div className="comm-audience__pills comm-audience__pills--wrap">
              {MINISTRIES.map((m) => (
                <button
                  key={m} type="button"
                  className={`comm-pill${filters.ministries.includes(m) ? ' comm-pill--active' : ''}`}
                  onClick={() => set({ ministries: toggle(filters.ministries, m) })}
                >{m}</button>
              ))}
            </div>
          </div>

          <div className="comm-audience__group">
            <p className="comm-audience__group-label">Age Group</p>
            <div className="comm-audience__pills">
              {AGE_GROUPS.map(({ value, label }) => (
                <button
                  key={value} type="button"
                  className={`comm-pill${filters.ageGroups.includes(value) ? ' comm-pill--active' : ''}`}
                  onClick={() => set({ ageGroups: toggle(filters.ageGroups, value) })}
                >{label}</button>
              ))}
            </div>
          </div>

          <div className="comm-audience__group">
            <p className="comm-audience__group-label">Geographic Zone</p>
            <div className="comm-audience__pills">
              {ZONES.map((z) => (
                <button
                  key={z} type="button"
                  className={`comm-pill${filters.zones.includes(z) ? ' comm-pill--active' : ''}`}
                  onClick={() => set({ zones: toggle(filters.zones, z) })}
                >{z}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AudienceSelector;
