'use client';

/**
 * MemberFilterBar — Day 14
 *
 * Filter controls:
 *   1. Ministry dropdown (multi-select checkboxes)
 *   2. Status multi-select pills
 *   3. Age Group range (multi-select pills)
 *   4. Join Date range (from / to date inputs)
 *   5. Geographic Zone (multi-select pills)
 *
 * Active filter count badge + Clear all button.
 * Panel collapses/expands with a toggle button.
 */
import { useRef, useState } from 'react';
import { ChevronDown, ChevronUp, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useMemberFilters,
  ALL_MINISTRIES,
  ALL_ZONES,
  ALL_AGE_GROUPS,
  AGE_GROUP_LABELS,
} from '@/hooks/useMemberFilters';
import type { MemberStatus, AgeGroup } from '@/lib/site';

type MemberFilterBarProps = {
  filterHook: ReturnType<typeof useMemberFilters>;
};

const STATUS_OPTIONS: { value: MemberStatus; label: string }[] = [
  { value: 'active',   label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'visitor',  label: 'Visitor' },
];

// ── Multi-select pill group ───────────────────────────────────────────────────

function PillGroup<T extends string>({
  options,
  selected,
  onToggle,
  labelFn,
}: {
  options: T[];
  selected: T[];
  onToggle: (v: T) => void;
  labelFn?: (v: T) => string;
}) {
  return (
    <div className="filter-pill-group">
      {options.map((opt) => {
        const isOn = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            className={cn('filter-pill', isOn && 'filter-pill--active')}
            aria-pressed={isOn}
            onClick={() => onToggle(opt)}
          >
            {labelFn ? labelFn(opt) : opt}
          </button>
        );
      })}
    </div>
  );
}

// ── Ministry multi-select dropdown ────────────────────────────────────────────

function MinistryDropdown({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="filter-dropdown" ref={ref}>
      <button
        type="button"
        className={cn('filter-dropdown__trigger', open && 'filter-dropdown__trigger--open')}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span>
          Ministry
          {selected.length > 0 && (
            <span className="filter-dropdown__badge">{selected.length}</span>
          )}
        </span>
        {open ? <ChevronUp size={13} aria-hidden="true" /> : <ChevronDown size={13} aria-hidden="true" />}
      </button>

      {open && (
        <div className="filter-dropdown__menu" role="listbox" aria-multiselectable="true" aria-label="Select ministries">
          {ALL_MINISTRIES.map((m) => {
            const checked = selected.includes(m);
            return (
              <label key={m} className="filter-dropdown__option">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  onChange={() => onToggle(m)}
                  aria-selected={checked}
                />
                <span className={cn('filter-dropdown__check', checked && 'filter-dropdown__check--on')} aria-hidden="true">
                  {checked && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4 4 10-10"/></svg>}
                </span>
                {m}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function MemberFilterBar({ filterHook }: MemberFilterBarProps) {
  const { filters, toggle, patch, clearAll, activeCount, isActive } = filterHook;
  const [open, setOpen] = useState(false);

  return (
    <div className="filter-bar">
      {/* ── Toggle row ── */}
      <div className="filter-bar__toggle-row">
        <button
          type="button"
          className={cn('filter-bar__toggle', isActive && 'filter-bar__toggle--active')}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          <SlidersHorizontal size={15} aria-hidden="true" />
          Filters
          {activeCount > 0 && (
            <span className="filter-bar__badge" aria-label={`${activeCount} active filters`}>
              {activeCount}
            </span>
          )}
          {open ? <ChevronUp size={13} aria-hidden="true" /> : <ChevronDown size={13} aria-hidden="true" />}
        </button>

        {isActive && (
          <button
            type="button"
            className="filter-bar__clear"
            onClick={clearAll}
            aria-label="Clear all filters"
          >
            <X size={13} aria-hidden="true" /> Clear all
          </button>
        )}

        {/* Active filter chips summary */}
        {isActive && (
          <div className="filter-bar__active-chips" aria-label="Active filters">
            {filters.statuses.map((s) => (
              <span key={s} className="filter-chip">
                {s}
                <button
                  type="button"
                  className="filter-chip__remove"
                  onClick={() => toggle('statuses', s)}
                  aria-label={`Remove ${s} filter`}
                >
                  <X size={10} />
                </button>
              </span>
            ))}
            {filters.ministries.map((m) => (
              <span key={m} className="filter-chip">
                {m}
                <button type="button" className="filter-chip__remove" onClick={() => toggle('ministries', m)} aria-label={`Remove ${m}`}>
                  <X size={10} />
                </button>
              </span>
            ))}
            {filters.ageGroups.map((a) => (
              <span key={a} className="filter-chip">
                {AGE_GROUP_LABELS[a]}
                <button type="button" className="filter-chip__remove" onClick={() => toggle('ageGroups', a)} aria-label={`Remove ${AGE_GROUP_LABELS[a]}`}>
                  <X size={10} />
                </button>
              </span>
            ))}
            {(filters.joinDateFrom || filters.joinDateTo) && (
              <span className="filter-chip">
                Joined: {filters.joinDateFrom || '…'} – {filters.joinDateTo || '…'}
                <button type="button" className="filter-chip__remove" onClick={() => { patch('joinDateFrom', ''); patch('joinDateTo', ''); }} aria-label="Remove join date filter">
                  <X size={10} />
                </button>
              </span>
            )}
            {filters.zones.map((z) => (
              <span key={z} className="filter-chip">
                {z}
                <button type="button" className="filter-chip__remove" onClick={() => toggle('zones', z)} aria-label={`Remove ${z}`}>
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Expanded filter panel ── */}
      {open && (
        <div className="filter-bar__panel" role="group" aria-label="Member filters">

          {/* 1 — Ministry */}
          <div className="filter-group">
            <p className="filter-group__label">Ministry</p>
            <MinistryDropdown
              selected={filters.ministries}
              onToggle={(v) => toggle('ministries', v)}
            />
          </div>

          {/* 2 — Status */}
          <div className="filter-group">
            <p className="filter-group__label">Status</p>
            <PillGroup<MemberStatus>
              options={STATUS_OPTIONS.map((o) => o.value)}
              selected={filters.statuses}
              onToggle={(v) => toggle('statuses', v)}
              labelFn={(v) => STATUS_OPTIONS.find((o) => o.value === v)?.label ?? v}
            />
          </div>

          {/* 3 — Age Group */}
          <div className="filter-group">
            <p className="filter-group__label">Age group</p>
            <PillGroup<AgeGroup>
              options={ALL_AGE_GROUPS}
              selected={filters.ageGroups}
              onToggle={(v) => toggle('ageGroups', v)}
              labelFn={(v) => AGE_GROUP_LABELS[v]}
            />
          </div>

          {/* 4 — Join Date range */}
          <div className="filter-group">
            <p className="filter-group__label">Joined</p>
            <div className="filter-date-range">
              <div className="filter-date-range__field">
                <label htmlFor="join-from" className="filter-date-range__label">From</label>
                <input
                  id="join-from"
                  type="date"
                  className="filter-date-range__input"
                  value={filters.joinDateFrom}
                  max={filters.joinDateTo || undefined}
                  onChange={(e) => patch('joinDateFrom', e.target.value)}
                />
              </div>
              <span className="filter-date-range__sep" aria-hidden="true">–</span>
              <div className="filter-date-range__field">
                <label htmlFor="join-to" className="filter-date-range__label">To</label>
                <input
                  id="join-to"
                  type="date"
                  className="filter-date-range__input"
                  value={filters.joinDateTo}
                  min={filters.joinDateFrom || undefined}
                  onChange={(e) => patch('joinDateTo', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* 5 — Geographic Zone */}
          <div className="filter-group">
            <p className="filter-group__label">Zone</p>
            <PillGroup<string>
              options={ALL_ZONES}
              selected={filters.zones}
              onToggle={(v) => toggle('zones', v)}
            />
          </div>

        </div>
      )}
    </div>
  );
}

export default MemberFilterBar;
