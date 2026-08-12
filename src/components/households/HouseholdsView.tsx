'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Home, Users, MapPin, Search, AlertCircle, RefreshCw } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { RELATION_LABELS, type Household } from '@/lib/households';

// ── Avatar helpers (shared visual language with member cards) ──────────────────

const AVATAR_COLOURS = [
  '#b25131', '#274c3f', '#2563eb', '#7c3aed',
  '#0891b2', '#d97706', '#16a34a', '#dc2626',
];

function avatarColour(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLOURS[Math.abs(hash) % AVATAR_COLOURS.length];
}

function initials(name: string): string {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

// ── Component ─────────────────────────────────────────────────────────────────

export function HouseholdsView() {
  const [households, setHouseholds] = useState<Household[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [query,   setQuery]   = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/households');
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const json = await res.json();
      setHouseholds(json.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load households.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return households;
    return households.filter((h) =>
      h.name.toLowerCase().includes(q) ||
      h.members.some((m) => m.fullName.toLowerCase().includes(q)),
    );
  }, [households, query]);

  const totalMembers = households.reduce((sum, h) => sum + h.memberCount, 0);

  // Day 57 Task 2 — households can have long nested member lists, so card
  // heights vary; measureElement lets react-virtual size each row for real
  // rather than guessing, while still only rendering what's on screen.
  const listRef = useRef<HTMLDivElement | null>(null);
  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => 220,
    overscan: 4,
  });

  return (
    <div className="hh-view">
      {/* Header */}
      <div className="hh-view__head">
        <div>
          <h1 className="hh-view__title">Households</h1>
          <p className="hh-view__sub">
            {loading
              ? 'Loading…'
              : `${households.length} household${households.length === 1 ? '' : 's'} · ${totalMembers} members`}
          </p>
        </div>
        <div className="hh-view__search">
          <Search size={15} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search households or members…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search households"
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive" title="Could not load households" onClose={() => setError('')}>
          {error}{' '}
          <button type="button" className="member-dir__retry-btn" onClick={() => void load()}>
            <RefreshCw size={13} aria-hidden="true" /> Retry
          </button>
        </Alert>
      )}

      {/* Virtualized list — only the households on screen are ever mounted */}
      {loading ? (
        <div className="hh-grid">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="hh-card hh-card--skeleton" />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="hh-vlist" ref={listRef}>
          <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const h = filtered[virtualRow.index];
              if (!h) return null;
              return (
                <article
                  key={h.id}
                  ref={virtualizer.measureElement}
                  data-index={virtualRow.index}
                  className="hh-card hh-card--virtual"
                  style={{ transform: `translateY(${virtualRow.start}px)`, position: 'absolute', top: 0, left: 0, right: 0 }}
                >
                  <header className="hh-card__head">
                    <div className="hh-card__icon" aria-hidden="true"><Home size={17} /></div>
                    <div className="hh-card__title-wrap">
                      <h2 className="hh-card__name">{h.name}</h2>
                      <div className="hh-card__meta">
                        <span><Users size={12} aria-hidden="true" /> {h.memberCount}</span>
                        {h.zone && <span><MapPin size={12} aria-hidden="true" /> {h.zone}</span>}
                      </div>
                    </div>
                  </header>

                  <ul className="hh-card__members" aria-label={`Members of ${h.name}`}>
                    {h.members.map((m) => (
                      <li key={m.id} className="hh-member">
                        <span
                          className="hh-member__avatar"
                          style={{ background: m.photoUrl ? 'transparent' : avatarColour(m.fullName) }}
                          aria-hidden="true"
                        >
                          {m.photoUrl
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={m.photoUrl} alt={m.fullName} className="hh-member__avatar-img" />
                            : initials(m.fullName)}
                        </span>
                        <span className="hh-member__copy">
                          <span className="hh-member__name">{m.fullName}</span>
                          <span className="hh-member__email">{m.email}</span>
                        </span>
                        <span className={`hh-member__relation hh-member__relation--${m.relation}`}>
                          {RELATION_LABELS[m.relation]}
                        </span>
                        <span
                          className={`hh-member__status hh-member__status--${m.status}`}
                          title={m.status}
                          aria-label={`Status: ${m.status}`}
                        />
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="member-dir__empty" role="status">
          <AlertCircle size={36} strokeWidth={1.5} aria-hidden="true" />
          <strong>No households found</strong>
          <p>{query ? 'Try a different search term.' : 'No households to display yet.'}</p>
        </div>
      )}
    </div>
  );
}

export default HouseholdsView;
