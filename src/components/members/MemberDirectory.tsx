'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Users, AlertCircle, RefreshCw, UserPlus } from 'lucide-react';
import { MemberSearchBar }    from '@/components/members/MemberSearchBar';
import { MemberFilterBar }    from '@/components/members/MemberFilterBar';
import { MemberCard }         from '@/components/members/MemberCard';
import { MemberDirectorySkeleton } from '@/components/members/MemberCardSkeleton';
import { MemberProfileDrawer }from '@/components/members/MemberProfileDrawer';
import { AddMemberForm }      from '@/components/members/AddMemberForm';
import { Pagination }         from '@/components/ui/Pagination';
import { Alert }              from '@/components/ui/Alert';
import { useMemberFilters }   from '@/hooks/useMemberFilters';
import type { Member }        from '@/lib/site';

type ApiResponse = { data: Member[]; total: number; page: number; pageSize: number };
const PAGE_SIZE = 12;

function useDebounced<T>(value: T, ms = 300): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}

export function MemberDirectory() {
  const [query,          setQuery]          = useState('');
  const [page,           setPage]           = useState(1);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [addingMember,   setAddingMember]   = useState(false);

  const filterHook = useMemberFilters();
  const { filters, toParams, activeCount } = filterHook;

  const [members, setMembers] = useState<Member[]>([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const debouncedQuery = useDebounced(query, 300);

  useEffect(() => { setPage(1); }, [debouncedQuery, filters]);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    if (debouncedQuery) params.set('q', debouncedQuery);
    toParams(params);

    try {
      const res  = await fetch(`/api/members?${params.toString()}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const json = (await res.json()) as ApiResponse;
      setMembers(json.data);
      setTotal(json.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load members.');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedQuery, toParams]);

  useEffect(() => { void fetchMembers(); }, [fetchMembers]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const countLabel = useMemo(() => {
    if (loading) return '…';
    const suffix     = total === 1 ? 'member' : 'members';
    const filterNote = activeCount > 0 ? ` (${activeCount} filter${activeCount > 1 ? 's' : ''} active)` : '';
    return `${total} ${suffix}${filterNote}`;
  }, [loading, total, activeCount]);

  return (
    <div className="member-dir">

      {/* Top row: search + Add Member */}
      <div className="member-dir__top-row">
        <MemberSearchBar
          value={query}
          onChange={setQuery}
          onSearch={setQuery}
          className="member-dir__meilisearch"
        />
        <button
          type="button"
          className="member-dir__add-btn"
          onClick={() => setAddingMember(true)}
          aria-label="Add new member"
        >
          <UserPlus size={15} aria-hidden="true" />
          Add Member
        </button>
      </div>

      {/* Filter bar */}
      <MemberFilterBar filterHook={filterHook} />

      {/* Count */}
      <div className="member-dir__toolbar member-dir__toolbar--compact">
        <p className="member-dir__count" aria-live="polite">
          <Users size={14} aria-hidden="true" />
          {countLabel}
        </p>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive" title="Could not load members" onClose={() => setError('')}>
          {error}{' '}
          <button type="button" className="member-dir__retry-btn" onClick={() => void fetchMembers()}>
            <RefreshCw size={13} aria-hidden="true" /> Retry
          </button>
        </Alert>
      )}

      {/* Grid / Skeleton / Empty */}
      {loading ? (
        <MemberDirectorySkeleton count={PAGE_SIZE} />
      ) : members.length > 0 ? (
        <div className="member-dir__grid" aria-label="Member cards">
          {members.map((m) => <MemberCard key={m.id} member={m} onClick={setSelectedMember} />)}
        </div>
      ) : !error ? (
        <div className="member-dir__empty" role="status">
          <AlertCircle size={36} strokeWidth={1.5} aria-hidden="true" />
          <strong>No members found</strong>
          <p>
            {query || activeCount > 0
              ? 'Try adjusting your search or removing some filters.'
              : 'No members match the current view.'}
          </p>
        </div>
      ) : null}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Pagination
          page={page}
          pageSize={PAGE_SIZE}
          total={total}
          onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        />
      )}

      {/* Profile drawer */}
      <MemberProfileDrawer
        member={selectedMember}
        allMembers={members}
        onClose={() => setSelectedMember(null)}
        onNavigate={(m) => setSelectedMember(m)}
      />

      {/* Add Member form (modal overlay) */}
      {addingMember && (
        <AddMemberForm
          onClose={() => setAddingMember(false)}
          onCreated={() => { setAddingMember(false); void fetchMembers(); }}
        />
      )}
    </div>
  );
}

export default MemberDirectory;
