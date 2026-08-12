'use client';

import { Users, Crown, Shield } from 'lucide-react';
import type { Member } from '@/lib/site';

// ── Types ─────────────────────────────────────────────────────────────────────

type GroupRole = 'leader' | 'co_leader' | 'member';

type GroupMembership = {
  id: string;
  name: string;
  type: 'ministry' | 'cell' | 'service' | 'choir' | 'other';
  role: GroupRole;
  joinedAt: string;   // ISO date
  memberCount: number;
};

// ── Mock data — derived from member.ministries ────────────────────────────────

const GROUP_TYPE_LABELS: Record<GroupMembership['type'], string> = {
  ministry: 'Ministry',
  cell:     'Cell Group',
  service:  'Service Team',
  choir:    'Choir',
  other:    'Other',
};

// Deterministic type from ministry name
function inferType(name: string): GroupMembership['type'] {
  const n = name.toLowerCase();
  if (n.includes('choir') || n.includes('worship') || n.includes('music')) return 'choir';
  if (n.includes('cell') || n.includes('small group'))                       return 'cell';
  if (n.includes('usher') || n.includes('media') || n.includes('tech') ||
      n.includes('hospitality'))                                              return 'service';
  return 'ministry';
}

function getMockGroups(member: Member): GroupMembership[] {
  const joined = new Date(member.joinedDate);

  return member.ministries.map((ministry, i) => {
    const joinDate = new Date(joined);
    joinDate.setDate(joinDate.getDate() + i * 14);

    // First ministry → leader if ministry_leader role, else member
    const role: GroupRole =
      i === 0 && member.role === 'ministry_leader' ? 'leader'
      : i === 1 && member.role === 'ministry_leader' ? 'co_leader'
      : 'member';

    return {
      id:          `${member.id}-grp-${i}`,
      name:        ministry,
      type:        inferType(ministry),
      role,
      joinedAt:    joinDate.toISOString().slice(0, 10),
      memberCount: 8 + ((i * 7 + member.id.charCodeAt(1)) % 24),
    };
  });
}

// ── Role badge ────────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<GroupRole, { label: string; icon: React.ReactNode; cls: string }> = {
  leader:    { label: 'Leader',    icon: <Crown size={11} />,  cls: 'mpd-groups__role--leader' },
  co_leader: { label: 'Co-leader', icon: <Shield size={11} />, cls: 'mpd-groups__role--co-leader' },
  member:    { label: 'Member',    icon: null,                  cls: 'mpd-groups__role--member' },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

// ── Component ─────────────────────────────────────────────────────────────────

type MemberGroupsTabProps = { member: Member };

export function MemberGroupsTab({ member }: MemberGroupsTabProps) {
  const groups = getMockGroups(member);

  if (groups.length === 0) {
    return (
      <div className="mpd-groups__empty">
        <Users size={28} strokeWidth={1.5} />
        <p>Not assigned to any groups yet.</p>
        <p className="mpd-groups__empty-hint">
          Groups will appear here once configured in the database.
        </p>
      </div>
    );
  }

  return (
    <div className="mpd-groups">
      <p className="mpd-groups__count">
        {groups.length} group{groups.length !== 1 ? 's' : ''}
      </p>

      <ul className="mpd-groups__list" aria-label="Group memberships">
        {groups.map((g) => {
          const roleCfg = ROLE_CONFIG[g.role];
          return (
            <li key={g.id} className="mpd-groups__item">
              {/* Icon */}
              <span className="mpd-groups__icon" aria-hidden="true">
                <Users size={15} />
              </span>

              {/* Info */}
              <div className="mpd-groups__copy">
                <span className="mpd-groups__name">{g.name}</span>
                <span className="mpd-groups__meta">
                  <span className="mpd-groups__type">{GROUP_TYPE_LABELS[g.type]}</span>
                  <span className="mpd-groups__sep" aria-hidden="true">·</span>
                  <span className="mpd-groups__members">{g.memberCount} members</span>
                  <span className="mpd-groups__sep" aria-hidden="true">·</span>
                  <span className="mpd-groups__since">Since {formatDate(g.joinedAt)}</span>
                </span>
              </div>

              {/* Role badge */}
              <span className={`mpd-groups__role ${roleCfg.cls}`}>
                {roleCfg.icon}
                {roleCfg.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
