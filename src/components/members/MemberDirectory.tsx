'use client';

/**
 * MemberDirectory — Day 12 upgrade.
 *
 * Fetches from GET /api/members with:
 *   - Debounced search query
 *   - Status filter
 *   - Server-side pagination (Pagination component)
 *
 * Shows MemberDirectorySkeleton while loading.
 * Shows an error banner on failure.
 * Resets to page 1 on any filter/search change.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Users, AlertCircle, RefreshCw } from 'lucide-react';
import { MemberCard } from '@/components/members/MemberCard';
import { MemberDirectorySkeleton } from '@/components/members/MemberCardSkeleton';
import { Pagination } from '@/components/ui/Pagination';
import { Alert } from '@/components/ui/Alert';
import type { Member, MemberStatus } from '@/lib/site';

// ── Types ─────────────────────────────────────────────────────────────────────

type FilterTab = 'all' | MemberStatus;

type ApiResponse = {
  data: Member[];
  total: number;
  page: number;
  pageSize: number;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 12;

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: 'all',      label: 'All' },
  { value: 'active',   label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'visitor',  label: 'Visitor' },
];

// ── Simple debounce hook ──────────────────────────────────────────────────────

function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function MemberDirectory() {
  const [query,  setQuery]  = useState('');
  const [filter, setFilter] = useState<FilterTab>('all');
  const [page,   setPage]   = useState(1);

  const [members, setMembers] = useState<Member[]>([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const debouncedQuery = useDebounced(query, 300);

  // Reset page to 1 whenever search or filter changes
  useEffect(() => { setPage(1); }, [debouncedQuery, filter]);

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError('');

    const params = new URLSearchParams({
      page:     String(page),
      pageSize: String(PAGE_SIZE),
      status:   filter,
    });
    if (debouncedQuery) params.set('q', debouncedQuery);

    try {
      const res = await fetch(`/api/members?${params.toString()}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const json = (await res.json()) as ApiResponse;
      setMembers(json.data);
      setTotal(json.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load members.');
    } finally {
      setLoading(false);
    }
  }, [page, filter, debouncedQuery]);

  useEffect(() => { void fetchMembers(); }, [fetchMembers]);

  // ── Counts for tabs (derived from total per status; quick local counts) ──

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Optimistic tab counts — only accurate for the current unfiltered total
  // A real implementation would fetch counts separately or use a summary endpoint
  const tabCount = useMemo(() => ({
    all: filter === 'all' ? total : undefined,
    active:   filter === 'active'   ? total : undefined,
    inactive: filter === 'inactive' ? total : undefined,
    visitor:  filter === 'visitor'  ? total : undefined,
  }), [filter, total]);

  return (
    <div className="member-dir">

      {/* ── Toolbar ── */}
      <div className="member-dir__toolbar">
        <div className="member-dir__search-wrap">
          <Search size={15} className="member-dir__search-icon" aria-hidden="true" />
          <input
            type="search"
            className="member-dir__search"
            placeholder="Search by name, email or ministry…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search members"
          />
        </div>
        <p className="member-dir__count" aria-live="polite">
          <Users size={14} aria-hidden="true" />
          {loading ? '…' : `${total} ${total === 1 ? 'member' : 'members'}`}
        </p>
      </div>

      {/* ── Filter tabs ── */}
      <div className="member-dir__tabs" role="tablist" aria-label="Filter by status">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={filter === tab.value ? 'true' : 'false'}
            className={`member-dir__tab${filter === tab.value ? ' member-dir__tab--active' : ''}`}
            onClick={() => setFilter(tab.value)}
          >
            {tab.label}
            {tabCount[tab.value] !== undefined && (
              <span className="member-dir__tab-count">{tabCount[tab.value]}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Error banner ── */}
      {error && (
        <Alert
          variant="destructive"
          title="Could not load members"
          onClose={() => setError('')}
        >
          {error}{' '}
          <button
            type="button"
            className="member-dir__retry-btn"
            onClick={() => void fetchMembers()}
          >
            <RefreshCw size={13} aria-hidden="true" /> Retry
          </button>
        </Alert>
      )}

      {/* ── Skeleton / Cards / Empty ── */}
      {loading ? (
        <MemberDirectorySkeleton count={PAGE_SIZE} />
      ) : members.length > 0 ? (
        <div className="member-dir__grid" aria-label="Member cards">
          {members.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      ) : !error ? (
        <div className="member-dir__empty" role="status">
          <AlertCircle size={36} strokeWidth={1.5} aria-hidden="true" />
          <strong>No members found</strong>
          <p>
            {query
              ? `No results for "${query}". Try a different search term.`
              : 'No members match the selected filter.'}
          </p>
        </div>
      ) : null}

      {/* ── Pagination ── */}
      {!loading && totalPages > 1 && (
        <Pagination
          page={page}
          pageSize={PAGE_SIZE}
          total={total}
          onPageChange={(p) => {
            setPage(p);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

    </div>
  );
}

export default MemberDirectory;
