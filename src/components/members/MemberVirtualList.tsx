'use client';

/**
 * MemberVirtualList — Day 57 Task 1. Only renders the ~10-20 rows
 * actually on screen, however large `members` is (tested up to 5,000+
 * via the "Load 5,000 test members" stress-test button in
 * MemberDirectory) — the rest exist only as data, not DOM nodes.
 */
import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Mail, Phone } from 'lucide-react';
import type { Member } from '@/lib/site';

const ROW_HEIGHT = 56;

const STATUS_TONE: Record<Member['status'], string> = {
  active: 'mvl-status--active', inactive: 'mvl-status--inactive', visitor: 'mvl-status--visitor',
};

type Props = {
  members: Member[];
  onSelect: (m: Member) => void;
  selected: Set<string>;
  onToggleSelect: (id: string) => void;
};

export function MemberVirtualList({ members, onSelect, selected, onToggleSelect }: Props) {
  const parentRef = useRef<HTMLDivElement | null>(null);

  const virtualizer = useVirtualizer({
    count: members.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  });

  const items = virtualizer.getVirtualItems();

  return (
    <div className="mvl" ref={parentRef}>
      <div className="mvl__spacer" style={{ height: virtualizer.getTotalSize() }}>
        {items.map((virtualRow) => {
          const m = members[virtualRow.index];
          if (!m) return null;
          return (
            <div
              key={m.id}
              className="mvl__row"
              style={{ height: virtualRow.size, transform: `translateY(${virtualRow.start}px)` }}
              onClick={() => onSelect(m)}
            >
              <input
                type="checkbox"
                checked={selected.has(m.id)}
                onClick={(e) => e.stopPropagation()}
                onChange={() => onToggleSelect(m.id)}
                aria-label={`Select ${m.fullName}`}
              />
              <span className="mvl__avatar">{m.fullName.split(' ').map((w) => w[0]).slice(0, 2).join('')}</span>
              <span className="mvl__name">{m.fullName}</span>
              <span className="mvl__contact"><Mail size={11} aria-hidden="true" /> {m.email}</span>
              {m.phone && <span className="mvl__contact"><Phone size={11} aria-hidden="true" /> {m.phone}</span>}
              <span className={`mvl__status ${STATUS_TONE[m.status]}`}>{m.status}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MemberVirtualList;
