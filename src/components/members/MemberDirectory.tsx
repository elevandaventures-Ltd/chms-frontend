'use client';

/**
 * MemberDirectory — masonry photo-card grid with search and filter (Day 11).
 *
 * Layout:
 *   - 2 columns  < 640px
 *   - 3 columns  640px – 1023px
 *   - 4 columns  ≥ 1024px
 *
 * Cards use CSS Grid with auto-rows to produce a masonry-style effect.
 * Cards with more ministry tags are slightly taller than simpler ones,
 * giving the grid natural visual rhythm without JavaScript masonry libs.
 *
 * Features:
 *   - Live text search (name, email, ministry)
 *   - Status filter tabs (All / Active / Inactive / Visitor)
 *   - Member count in header
 *   - Empty state when no results match
 */
import { useMemo, useState } from 'react';
import { Search, Users } from 'lucide-react';
import { MemberCard } from '@/components/members/MemberCard';
import type { Member, MemberStatus } from '@/lib/site';

type FilterTab = 'all' | MemberStatus;

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: 'all',      label: 'All' },
  { value: 'active',   label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'visitor',  label: 'Visitor' },
];

type MemberDirectoryProps = {
  members: Member[];
};

export function MemberDirectory({ members }: MemberDirectoryProps) {
  const [query,  setQuery]  = useState('');
  const [filter, setFilter] = useState<FilterTab>('all');

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return members.filter((m) => {
      const matchesStatus = filter === 'all' || m.status === filter;
      const matchesQuery  = !q
        || m.fullName.toLowerCase().includes(q)
        || m.email.toLowerCase().includes(q)
        || m.ministries.some((t) => t.toLowerCase().includes(q));
      return matchesStatus && matchesQuery;
    });
  }, [members, query, filter]);

  // Count per status for tab badges
  const counts = useMemo(() => ({
    all:      members.length,
    active:   members.filter((m) => m.status === 'active').length,
    inactive: members.filter((m) => m.status === 'inactive').length,
    visitor:  members.filter((m) => m.status === 'visitor').length,
  }), [members]);

  return (
    <div className="member-dir">
      {/* ── Toolbar ── */}
      <div className="member-dir__toolbar">
        {/* Search */}
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

        {/* Member count */}
        <p className="member-dir__count" aria-live="polite">
          <Users size={14} aria-hidden="true" />
          {filtered.length} {filtered.length === 1 ? 'member' : 'members'}
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
            <span className="member-dir__tab-count">{counts[tab.value]}</span>
          </button>
        ))}
      </div>

      {/* ── Card grid ── */}
      {filtered.length > 0 ? (
        <div className="member-dir__grid" aria-label="Member cards">
          {filtered.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      ) : (
        <div className="member-dir__empty" role="status">
          <Users size={36} strokeWidth={1.5} aria-hidden="true" />
          <strong>No members found</strong>
          <p>
            {query
              ? `No results for "${query}". Try a different search term.`
              : 'No members match the selected filter.'}
          </p>
        </div>
      )}
    </div>
  );
}

export default MemberDirectory;
