'use client';

/**
 * MemberCard — photo card for the Member Directory masonry grid (Day 11).
 *
 * Displays:
 *   - Profile photo (with initials fallback)
 *   - Full name + email
 *   - Status badge: Active / Inactive / Visitor
 *   - Ministry tags (up to 3 visible, remainder shown as +N)
 *   - Role label
 *
 * Clicking the card navigates to the member profile page (future sprint).
 */
import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Member, MemberStatus } from '@/lib/site';

// ── Status badge config ───────────────────────────────────────────────────────

const STATUS_CONFIG: Record<MemberStatus, { label: string; className: string }> = {
  active:   { label: 'Active',   className: 'member-card__status--active' },
  inactive: { label: 'Inactive', className: 'member-card__status--inactive' },
  visitor:  { label: 'Visitor',  className: 'member-card__status--visitor' },
};

// ── Role display labels ───────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  admin:           'Admin',
  pastor:          'Pastor',
  finance:         'Finance',
  ministry_leader: 'Ministry Leader',
  staff:           'Staff',
  member:          'Member',
};

// ── Initials colour — deterministic from name ─────────────────────────────────

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

type MemberCardProps = {
  member: Member;
  className?: string;
  onClick?: (member: Member) => void;
};

const MAX_TAGS = 3;

export function MemberCard({ member, className, onClick }: MemberCardProps) {
  const statusCfg = STATUS_CONFIG[member.status];
  const visibleTags = member.ministries.slice(0, MAX_TAGS);
  const extraTags   = member.ministries.length - MAX_TAGS;
  const bgColour    = avatarColour(member.fullName);

  return (
    <Link
      href={`/members/${member.id}`}
      className={cn('member-card', className)}
      aria-label={`View profile for ${member.fullName}`}
      onClick={onClick ? (e) => { e.preventDefault(); onClick(member); } : undefined}
    >
      {/* ── Photo / Avatar ── */}
      <div className="member-card__photo-wrap">
        {member.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.photoUrl}
            alt={member.fullName}
            className="member-card__photo"
          />
        ) : (
          <div
            className="member-card__initials"
            style={{ background: bgColour }}
            aria-hidden="true"
          >
            {initials(member.fullName)}
          </div>
        )}

        {/* Status badge — overlaid bottom-right of photo */}
        <span className={cn('member-card__status', statusCfg.className)} aria-label={`Status: ${statusCfg.label}`}>
          {statusCfg.label}
        </span>
      </div>

      {/* ── Content ── */}
      <div className="member-card__body">
        <div className="member-card__identity">
          <h3 className="member-card__name">{member.fullName}</h3>
          <span className="member-card__role">{ROLE_LABELS[member.role] ?? member.role}</span>
        </div>

        <div className="member-card__contact">
          <span className="member-card__contact-item">
            <Mail size={12} aria-hidden="true" />
            <span>{member.email}</span>
          </span>
          {member.phone && (
            <span className="member-card__contact-item">
              <Phone size={12} aria-hidden="true" />
              <span>{member.phone}</span>
            </span>
          )}
        </div>

        {/* Ministry tags */}
        {member.ministries.length > 0 && (
          <div className="member-card__tags" aria-label="Ministry teams">
            {visibleTags.map((tag) => (
              <span key={tag} className="member-card__tag">{tag}</span>
            ))}
            {extraTags > 0 && (
              <span className="member-card__tag member-card__tag--more">+{extraTags}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

export default MemberCard;
