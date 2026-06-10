'use client';

/**
 * MemberDirectory — Day 13 upgrade.
 *
 * Uses MemberSearchBar (Meilisearch-powered) for instant fuzzy search.
 * Clicking a search result navigates to that member.
 * Typing and pressing Enter filters the full grid.
 * Status tabs + Pagination remain from Day 12.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Users, AlertCircle, RefreshCw } from 'lucide-react';
import { MemberSearchBar } from '@/components/members/MemberSearchBar';
import { MemberCard } from '@/components/members/MemberCard';
import { MemberDirectorySkeleton } from '@/components/members/MemberCardSkeleton';
import { Pagination } from '@/components/ui/Pagination';
import { Alert } from '@/components/ui/Alert';
import type { Member, MemberStatus } from '@/lib/site';

type FilterTab = 'all' | MemberStatus;

type ApiResponse = {
  data: Member[];
  total: number;
  page: number;
  pageSize: number;
};

const PAGE_SIZE = 12;

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: 'all',      label: 'All' },
  { value: 'active',   label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'visitor',  label: 'Visitor' },
];

function useDebounced<T>(value: T, ms = 300): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}

export function MemberDirectory() {
  const [query,  setQuery]  = useState('');
  const [filter, setFilter] = useState<FilterTab>('all');
  const [page,   setPage]   = useState(1);

  const [members, setMembers] = useState<Member[]>([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const debouncedQuery = useDebounced(query, 300);

  useEffect(() => { setPage(1); }, [debouncedQuery, filter]);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams({
      page: String(page), pageSize: String(PAGE_SIZE), status: filter,
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

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const tabCount = useMemo(() => ({
    all:      filter === 'all'      ? total : undefined,
    active:   filter === 'active'   ? total : undefined,
    inactive: filter === 'inactive' ? total : undefined,
    visitor:  filter === 'visitor'  ? total : undefined,
  }), [filter, total]);

  return (
    <div className="member-dir">

      {/* ── Search bar (Meilisearch-powered) ── */}
      <MemberSearchBar
        value={query}
        onChange={(q) => setQuery(q)}
        onSearch={(q) => setQuery(q)}
        className="member-dir__meilisearch"
      />

      {/* ── Toolbar: count ── */}
      <div className="member-dir__toolbar member-dir__toolbar--compact">
        <p className="member-dir__count" aria-live="polite">
          <Users size={14} aria-hidden="true" />
          {loading ? '…' : `${total} ${total === 1 ? 'member' : 'members'}`}
        </p>
      </div>

      {/* ── Status filter tabs ── */}
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

      {/* ── Error ── */}
      {error && (
        <Alert variant="destructive" title="Could not load members" onClose={() => setError('')}>
          {error}{' '}
          <button type="button" className="member-dir__retry-btn" onClick={() => void fetchMembers()}>
            <RefreshCw size={13} aria-hidden="true" /> Retry
          </button>
        </Alert>
      )}

      {/* ── Grid / Skeleton / Empty ── */}
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
          onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        />
      )}
    </div>
  );
}

export default MemberDirectory;
