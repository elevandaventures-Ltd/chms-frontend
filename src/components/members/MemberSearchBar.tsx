'use client';

/**
 * MemberSearchBar — Day 13 instant fuzzy search (Meilisearch).
 *
 * Features:
 *   - 300ms debounced input
 *   - Calls /api/search/members for fuzzy matching
 *   - Highlighted matched terms rendered from Meilisearch _formatted fields
 *   - Dropdown results panel (no page reload)
 *   - Keyboard navigation (↑ ↓ Enter Escape)
 *   - "No results found" state with helpful message
 *   - Search time shown when Meilisearch is connected
 *
 * When the user selects a result, `onSelect` is called with the member.
 * When the user submits a query without selecting (Enter), `onSearch` is
 * called so the parent directory can filter by that query.
 */
import {
  useCallback, useEffect, useRef, useState, type KeyboardEvent,
} from 'react';
import { Search, X, Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Member } from '@/lib/site';
import type { SearchHit } from '@/app/api/search/members/route';

// ── Debounce hook ─────────────────────────────────────────────────────────────

function useDebounced<T>(value: T, ms = 300): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}

// ── Safe HTML renderer — only for pre-sanitised Meilisearch output ────────────

function HighlightedText({ html, fallback }: { html?: string; fallback: string }) {
  if (!html) return <>{fallback}</>;
  // _formatted fields from Meilisearch only contain <em> tags — safe to render
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

// ── Component ─────────────────────────────────────────────────────────────────

type MemberSearchBarProps = {
  /** Called when the user selects a specific member from the dropdown */
  onSelect?: (member: Member) => void;
  /** Called when the user presses Enter to search (passes query to parent) */
  onSearch?: (query: string) => void;
  /** Controlled value from parent (optional) */
  value?: string;
  onChange?: (q: string) => void;
  placeholder?: string;
  className?: string;
};

export function MemberSearchBar({
  onSelect,
  onSearch,
  value: controlledValue,
  onChange,
  placeholder = 'Search members — try "Jon" to find "John"…',
  className,
}: MemberSearchBarProps) {
  const isControlled = controlledValue !== undefined;

  const [internalQuery, setInternalQuery] = useState('');
  const query = isControlled ? controlledValue : internalQuery;

  const setQuery = useCallback((q: string) => {
    if (!isControlled) setInternalQuery(q);
    onChange?.(q);
  }, [isControlled, onChange]);

  const debouncedQuery = useDebounced(query, 300);

  const [hits,     setHits]     = useState<SearchHit[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [open,     setOpen]     = useState(false);
  const [activeIdx, setActive]  = useState(-1);
  const [timeMs,   setTimeMs]   = useState<number | null>(null);

  const inputRef    = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Fetch from /api/search/members ────────────────────────────────────────

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setHits([]); setOpen(false); setTimeMs(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch(`/api/search/members?q=${encodeURIComponent(debouncedQuery)}&limit=8`)
      .then((r) => r.json())
      .then((data: { hits: SearchHit[]; total: number; processingTimeMs: number }) => {
        if (cancelled) return;
        setHits(data.hits ?? []);
        setTimeMs(data.processingTimeMs ?? null);
        setOpen(true);
        setActive(-1);
      })
      .catch(() => { if (!cancelled) { setHits([]); setOpen(true); } })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [debouncedQuery]);

  // ── Close dropdown on outside click ──────────────────────────────────────

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // ── Keyboard navigation ───────────────────────────────────────────────────

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!open) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, hits.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0 && hits[activeIdx]) {
        handleSelect(hits[activeIdx]);
      } else {
        onSearch?.(query);
        setOpen(false);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActive(-1);
    }
  }

  function handleSelect(hit: SearchHit) {
    onSelect?.(hit);
    setQuery(hit.fullName);
    setOpen(false);
  }

  function handleClear() {
    setQuery('');
    setHits([]);
    setOpen(false);
    onSearch?.('');
    inputRef.current?.focus();
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className={cn('msearch', className)}>
      {/* Input */}
      <div className={cn('msearch__input-wrap', open && hits.length > 0 && 'msearch__input-wrap--open')}>
        {loading
          ? <span className="msearch__spinner" aria-hidden="true" />
          : <Search size={15} className="msearch__icon" aria-hidden="true" />
        }

        <input
          ref={inputRef}
          type="search"
          className="msearch__input"
          placeholder={placeholder}
          value={query}
          autoComplete="off"
          aria-label="Search members"
          aria-autocomplete="list"
          aria-expanded={open && hits.length > 0}
          aria-controls="msearch-results"
          aria-activedescendant={activeIdx >= 0 ? `msearch-hit-${activeIdx}` : undefined}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (hits.length > 0) setOpen(true); }}
        />

        {query && (
          <button
            type="button"
            className="msearch__clear"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X size={13} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Dropdown results */}
      {open && (
        <div
          id="msearch-results"
          className="msearch__dropdown"
          role="listbox"
          aria-label="Search results"
        >
          {hits.length > 0 ? (
            <>
              {/* Header — result count + processing time */}
              <div className="msearch__dropdown-header">
                <span className="msearch__result-count">
                  <Users size={12} aria-hidden="true" />
                  {hits.length} result{hits.length !== 1 ? 's' : ''}
                </span>
                {timeMs !== null && (
                  <span className="msearch__time">
                    <Clock size={11} aria-hidden="true" />
                    {timeMs}ms
                  </span>
                )}
              </div>

              {/* Result rows */}
              {hits.map((hit, idx) => (
                <button
                  key={hit.id}
                  id={`msearch-hit-${idx}`}
                  type="button"
                  role="option"
                  aria-selected={idx === activeIdx}
                  className={cn(
                    'msearch__hit',
                    idx === activeIdx && 'msearch__hit--active',
                  )}
                  onClick={() => handleSelect(hit)}
                  onMouseEnter={() => setActive(idx)}
                >
                  {/* Avatar / initials */}
                  <span
                    className="msearch__hit-avatar"
                    style={{
                      background: hit.photoUrl ? 'transparent' : getAvatarColour(hit.fullName),
                    }}
                  >
                    {hit.photoUrl
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={hit.photoUrl} alt="" className="msearch__hit-photo" />
                      : getInitials(hit.fullName)
                    }
                  </span>

                  <span className="msearch__hit-copy">
                    <span className="msearch__hit-name">
                      <HighlightedText
                        html={hit._formatted?.fullName}
                        fallback={hit.fullName}
                      />
                    </span>
                    <span className="msearch__hit-email">
                      <HighlightedText
                        html={hit._formatted?.email}
                        fallback={hit.email}
                      />
                    </span>
                    {hit.ministries.length > 0 && (
                      <span className="msearch__hit-tags">
                        {(hit._formatted?.ministries ?? hit.ministries)
                          .slice(0, 2)
                          .map((tag, ti) => (
                            <span
                              key={ti}
                              className="msearch__hit-tag"
                              dangerouslySetInnerHTML={{ __html: tag }}
                            />
                          ))}
                      </span>
                    )}
                  </span>

                  <span
                    className={cn(
                      'msearch__hit-status',
                      `msearch__hit-status--${hit.status}`,
                    )}
                  >
                    {hit.status}
                  </span>
                </button>
              ))}
            </>
          ) : (
            <div className="msearch__no-results">
              <Search size={20} strokeWidth={1.5} aria-hidden="true" />
              <strong>No results found</strong>
              <p>
                No members match <em>&ldquo;{query}&rdquo;</em>.<br />
                Try checking spelling or using a shorter term.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MemberSearchBar;

// ── Helpers ───────────────────────────────────────────────────────────────────

const COLOURS = ['#b25131','#274c3f','#2563eb','#7c3aed','#0891b2','#d97706','#16a34a','#dc2626'];

function getAvatarColour(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return COLOURS[Math.abs(h) % COLOURS.length];
}

function getInitials(name: string): string {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}
