'use client';

import type { Member } from '@/lib/site';

// Mock household relationships — in production these come from the households table
type HouseholdRelation = {
  role: 'spouse' | 'parent' | 'child';
  member: Member;
};

function getHouseholdRelations(_member: Member, allMembers: Member[]): HouseholdRelation[] {
  // Deterministic mock: pair members from same zone as "family"
  // Replace this with a real households DB query in a later sprint
  return allMembers
    .filter((m) => m.id !== _member.id && m.zone === _member.zone)
    .slice(0, 4)
    .map((m, i) => ({
      role: (['spouse', 'parent', 'child', 'child'] as const)[i] ?? 'child',
      member: m,
    }));
}

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

const ROLE_LABELS: Record<string, string> = {
  spouse: 'Spouse',
  parent: 'Parent',
  child:  'Child',
};

type MemberHouseholdTabProps = {
  member: Member;
  allMembers: Member[];
  onSelectMember: (member: Member) => void;
};

export function MemberHouseholdTab({ member, allMembers, onSelectMember }: MemberHouseholdTabProps) {
  const relations = getHouseholdRelations(member, allMembers);

  if (relations.length === 0) {
    return (
      <div className="mpd-household__empty">
        <p>No household members linked yet.</p>
        <p className="mpd-household__empty-hint">
          Household relationships will appear here once configured in the database.
        </p>
      </div>
    );
  }

  return (
    <div className="mpd-household">
      <p className="mpd-household__hint">
        Showing household members in the same geographic zone.{' '}
        <em>Full household DB integration coming in a later sprint.</em>
      </p>

      <ul className="mpd-household__list" aria-label="Household members">
        {relations.map(({ role, member: rel }) => (
          <li key={rel.id}>
            <button
              type="button"
              className="mpd-household__item"
              onClick={() => onSelectMember(rel)}
              aria-label={`View profile for ${rel.fullName}`}
            >
              {/* Avatar */}
              <div
                className="mpd-household__avatar"
                style={{ background: rel.photoUrl ? 'transparent' : avatarColour(rel.fullName) }}
                aria-hidden="true"
              >
                {rel.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={rel.photoUrl} alt={rel.fullName} className="mpd-household__avatar-img" />
                ) : (
                  initials(rel.fullName)
                )}
              </div>

              {/* Info */}
              <div className="mpd-household__copy">
                <span className="mpd-household__name">{rel.fullName}</span>
                <span className="mpd-household__relation">{ROLE_LABELS[role]}</span>
                <span className="mpd-household__email">{rel.email}</span>
              </div>

              {/* Status */}
              <span className={`mpd-household__status mpd-household__status--${rel.status}`}>
                {rel.status}
              </span>

              {/* Navigate arrow */}
              <span className="mpd-household__arrow" aria-hidden="true">›</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
