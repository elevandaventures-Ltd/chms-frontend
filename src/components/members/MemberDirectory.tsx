'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Users, AlertCircle, RefreshCw, UserPlus, Upload } from 'lucide-react';
import { MemberSearchBar }    from '@/components/members/MemberSearchBar';
import { MemberFilterBar }    from '@/components/members/MemberFilterBar';
import { MemberCard }         from '@/components/members/MemberCard';
import { MemberDirectorySkeleton } from '@/components/members/MemberCardSkeleton';
import { MemberProfileDrawer }from '@/components/members/MemberProfileDrawer';
import { AddMemberForm }      from '@/components/members/AddMemberForm';
import { EditMemberForm }     from '@/components/members/EditMemberForm';
import { MemberStatusModal }  from '@/components/members/MemberStatusModal';
import { BulkActionsBar }     from '@/components/members/BulkActionsBar';
import { BulkMinistryModal }  from '@/components/members/BulkMinistryModal';
import { BulkMessageModal }   from '@/components/members/BulkMessageModal';
import { ImportMembersWizard }from '@/components/members/ImportMembersWizard';
import { Pagination }         from '@/components/ui/Pagination';
import { Alert }              from '@/components/ui/Alert';
import { useMemberFilters }   from '@/hooks/useMemberFilters';
import { exportMembersCsv, exportMembersPdf } from '@/lib/export-members';
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
  const [editingMember,  setEditingMember]  = useState<Member | null>(null);
  const [statusMember,   setStatusMember]   = useState<Member | null>(null);

  // ── Bulk selection ──────────────────────────────────────────────────────
  // Map of id → Member so bulk actions have full data even across pages.
  const [selected,    setSelected]    = useState<Map<string, Member>>(new Map());
  const [bulkAction,  setBulkAction]  = useState<'ministry' | 'message' | null>(null);
  const [importing,   setImporting]   = useState(false);
  const [notice,      setNotice]      = useState('');

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

  // ── Selection helpers ──────────────────────────────────────────────────
  const selectedMembers   = useMemo(() => Array.from(selected.values()), [selected]);
  const pageSelectedCount = members.filter((m) => selected.has(m.id)).length;
  const allPageSelected   = members.length > 0 && pageSelectedCount === members.length;

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        const m = members.find((x) => x.id === id);
        if (m) next.set(id, m);
      }
      return next;
    });
  }, [members]);

  const toggleSelectAllPage = useCallback(() => {
    setSelected((prev) => {
      const next = new Map(prev);
      const everySelected = members.length > 0 && members.every((m) => next.has(m.id));
      if (everySelected) members.forEach((m) => next.delete(m.id));
      else               members.forEach((m) => next.set(m.id, m));
      return next;
    });
  }, [members]);

  const clearSelection = useCallback(() => setSelected(new Map()), []);

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
          className="member-dir__import-btn"
          onClick={() => setImporting(true)}
          aria-label="Import members from CSV"
        >
          <Upload size={15} aria-hidden="true" />
          Import CSV
        </button>
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

      {/* Count + Select all */}
      <div className="member-dir__toolbar member-dir__toolbar--compact">
        <p className="member-dir__count" aria-live="polite">
          <Users size={14} aria-hidden="true" />
          {countLabel}
        </p>
        {!loading && members.length > 0 && (
          <label className="member-dir__select-all">
            <input
              type="checkbox"
              checked={allPageSelected}
              ref={(el) => { if (el) el.indeterminate = pageSelectedCount > 0 && !allPageSelected; }}
              onChange={toggleSelectAllPage}
            />
            Select all on this page
          </label>
        )}
      </div>

      {/* Success notice */}
      {notice && (
        <Alert variant="success" onClose={() => setNotice('')}>{notice}</Alert>
      )}

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
          {members.map((m) => (
            <MemberCard
              key={m.id}
              member={m}
              onClick={setSelectedMember}
              selected={selected.has(m.id)}
              onToggleSelect={toggleSelect}
            />
          ))}
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
        onEdit={(m) => setEditingMember(m)}
        onChangeStatus={(m) => setStatusMember(m)}
      />

      {/* Add Member form (modal overlay) */}
      {addingMember && (
        <AddMemberForm
          onClose={() => setAddingMember(false)}
          onCreated={() => { setAddingMember(false); void fetchMembers(); }}
        />
      )}

      {/* Edit Member form (modal overlay) */}
      {editingMember && (
        <EditMemberForm
          memberId={editingMember.id}
          onClose={() => setEditingMember(null)}
          onUpdated={() => { setEditingMember(null); setSelectedMember(null); void fetchMembers(); }}
        />
      )}

      {/* Status change modal */}
      {statusMember && (
        <MemberStatusModal
          member={statusMember}
          onClose={() => setStatusMember(null)}
          onChanged={(status) => {
            // Reflect the change immediately in the open drawer, then refetch.
            setSelectedMember((prev) => (prev && prev.id === statusMember.id ? { ...prev, status } : prev));
            setStatusMember(null);
            void fetchMembers();
          }}
        />
      )}

      {/* CSV import wizard */}
      {importing && (
        <ImportMembersWizard
          onClose={() => setImporting(false)}
          onImported={({ added, updated, skipped }) => {
            setImporting(false);
            setNotice(`Import complete — ${added} added, ${updated} updated${skipped > 0 ? `, ${skipped} skipped` : ''}.`);
            void fetchMembers();
          }}
        />
      )}

      {/* Bulk actions toolbar */}
      {selected.size > 0 && (
        <BulkActionsBar
          count={selected.size}
          onClear={clearSelection}
          onAssignMinistry={() => setBulkAction('ministry')}
          onSendMessage={() => setBulkAction('message')}
          onExportCsv={() => {
            exportMembersCsv(selectedMembers);
            setNotice(`Exported ${selectedMembers.length} member${selectedMembers.length === 1 ? '' : 's'} to CSV.`);
          }}
          onExportPdf={() => exportMembersPdf(selectedMembers)}
        />
      )}

      {/* Bulk: assign ministry */}
      {bulkAction === 'ministry' && (
        <BulkMinistryModal
          memberIds={selectedMembers.map((m) => m.id)}
          onClose={() => setBulkAction(null)}
          onDone={({ updated, mode }) => {
            setNotice(`${mode === 'add' ? 'Assigned' : 'Replaced'} ministries for ${updated} member${updated === 1 ? '' : 's'}.`);
            clearSelection();
            void fetchMembers();
          }}
        />
      )}

      {/* Bulk: send message */}
      {bulkAction === 'message' && (
        <BulkMessageModal
          recipients={selectedMembers}
          onClose={() => setBulkAction(null)}
          onSent={({ sent, skipped, channel }) => {
            const label = channel === 'sms' ? 'SMS' : 'email';
            setNotice(`Sent ${label} to ${sent} member${sent === 1 ? '' : 's'}${skipped > 0 ? ` (${skipped} skipped).` : '.'}`);
            clearSelection();
          }}
        />
      )}
    </div>
  );
}

export default MemberDirectory;
