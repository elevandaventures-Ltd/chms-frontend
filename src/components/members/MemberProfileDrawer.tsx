'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Mail, Phone, MessageSquare, UserCheck, UserX } from 'lucide-react';
import { MemberInfoTab }      from '@/components/members/MemberInfoTab';
import { MemberHouseholdTab } from '@/components/members/MemberHouseholdTab';
import type { Member, MemberStatus } from '@/lib/site';

// ── Helpers ───────────────────────────────────────────────────────────────────

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

const STATUS_CONFIG: Record<MemberStatus, { label: string; cls: string }> = {
  active:   { label: 'Active',   cls: 'mpd-status--active' },
  inactive: { label: 'Inactive', cls: 'mpd-status--inactive' },
  visitor:  { label: 'Visitor',  cls: 'mpd-status--visitor' },
};

const ROLE_LABELS: Record<string, string> = {
  admin:           'Admin',
  pastor:          'Pastor',
  finance:         'Finance',
  ministry_leader: 'Ministry Leader',
  staff:           'Staff',
  member:          'Member',
};

// ── Tab definitions ───────────────────────────────────────────────────────────

type TabId = 'info' | 'household';

const TABS: { id: TabId; label: string }[] = [
  { id: 'info',      label: 'Info' },
  { id: 'household', label: 'Family & Household' },
];

// ── Props ─────────────────────────────────────────────────────────────────────

type MemberProfileDrawerProps = {
  member:    Member | null;
  allMembers: Member[];
  onClose:   () => void;
  onNavigate: (member: Member) => void;
};

// ── Component ─────────────────────────────────────────────────────────────────

export function MemberProfileDrawer({
  member,
  allMembers,
  onClose,
  onNavigate,
}: MemberProfileDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabId>('info');
  const closeRef  = useRef<HTMLButtonElement>(null);
  const isOpen    = Boolean(member);

  // Reset tab to Info whenever a new member is opened
  useEffect(() => {
    if (member) setActiveTab('info');
  }, [member?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Focus the close button when drawer opens for keyboard accessibility
  useEffect(() => {
    if (isOpen) closeRef.current?.focus();
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const statusCfg = member ? STATUS_CONFIG[member.status] : null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="mpd-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer sheet */}
      <aside
        className={`mpd-sheet${isOpen ? ' mpd-sheet--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={member ? `Profile: ${member.fullName}` : 'Member profile'}
        aria-hidden={String(!isOpen) as 'true' | 'false'}
      >
        {member && (
          <>
            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="mpd-header">
              <button
                ref={closeRef}
                type="button"
                className="mpd-header__close"
                onClick={onClose}
                aria-label="Close profile drawer"
              >
                <X size={18} />
              </button>

              {/* Photo */}
              <div
                className="mpd-header__photo"
                style={{ background: member.photoUrl ? 'transparent' : avatarColour(member.fullName) }}
                aria-hidden="true"
              >
                {member.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={member.photoUrl} alt={member.fullName} className="mpd-header__photo-img" />
                ) : (
                  <span className="mpd-header__initials">{initials(member.fullName)}</span>
                )}
              </div>

              {/* Identity */}
              <div className="mpd-header__identity">
                <h2 className="mpd-header__name">{member.fullName}</h2>
                <span className="mpd-header__role">{ROLE_LABELS[member.role] ?? member.role}</span>
                <span className={`mpd-status ${statusCfg!.cls}`}>{statusCfg!.label}</span>
              </div>

              {/* Quick action buttons */}
              <div className="mpd-header__actions" role="group" aria-label="Quick actions">
                <a
                  href={`mailto:${member.email}`}
                  className="mpd-action-btn"
                  aria-label={`Email ${member.fullName}`}
                  title="Send email"
                >
                  <Mail size={15} />
                  <span>Email</span>
                </a>

                {member.phone && (
                  <a
                    href={`tel:${member.phone}`}
                    className="mpd-action-btn"
                    aria-label={`Call ${member.fullName}`}
                    title="Call"
                  >
                    <Phone size={15} />
                    <span>Call</span>
                  </a>
                )}

                <button
                  type="button"
                  className="mpd-action-btn"
                  aria-label="Send message"
                  title="Message"
                  onClick={() => {/* messaging integration — future sprint */}}
                >
                  <MessageSquare size={15} />
                  <span>Message</span>
                </button>

                <button
                  type="button"
                  className={`mpd-action-btn ${member.status === 'active' ? 'mpd-action-btn--danger' : 'mpd-action-btn--success'}`}
                  aria-label={member.status === 'active' ? 'Mark as inactive' : 'Mark as active'}
                  title={member.status === 'active' ? 'Deactivate' : 'Activate'}
                  onClick={() => {/* status toggle — future sprint */}}
                >
                  {member.status === 'active'
                    ? <><UserX size={15} /><span>Deactivate</span></>
                    : <><UserCheck size={15} /><span>Activate</span></>
                  }
                </button>
              </div>
            </div>

            {/* ── Tabs ───────────────────────────────────────────────── */}
            <div className="mpd-tabs" role="tablist" aria-label="Profile sections">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  className={`mpd-tab${activeTab === tab.id ? ' mpd-tab--active' : ''}`}
                  aria-selected={String(activeTab === tab.id) as 'true' | 'false'}
                  aria-controls={`mpd-panel-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── Tab panels ─────────────────────────────────────────── */}
            <div className="mpd-body">
              <div
                id="mpd-panel-info"
                role="tabpanel"
                aria-labelledby="mpd-tab-info"
                hidden={activeTab !== 'info'}
              >
                <MemberInfoTab member={member} />
              </div>

              <div
                id="mpd-panel-household"
                role="tabpanel"
                aria-labelledby="mpd-tab-household"
                hidden={activeTab !== 'household'}
              >
                <MemberHouseholdTab
                  member={member}
                  allMembers={allMembers}
                  onSelectMember={(m) => { onNavigate(m); }}
                />
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

export default MemberProfileDrawer;
