'use client';

import { useEffect, useRef, useState } from 'react';
import {
  X, Mail, Phone, MessageSquare, UserCheck, UserX,
  FileText, Heart, MessageCircle,
} from 'lucide-react';
import { MemberInfoTab }      from '@/components/members/MemberInfoTab';
import { MemberHouseholdTab } from '@/components/members/MemberHouseholdTab';
import { MemberTimelineTab }  from '@/components/members/MemberTimelineTab';
import { MemberGroupsTab }    from '@/components/members/MemberGroupsTab';
import { MemberNotesTab }     from '@/components/members/MemberNotesTab';
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

// WhatsApp link — strips non-digits and prepends wa.me
function whatsappUrl(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `https://wa.me/${digits}`;
}

// ── Tab definitions ───────────────────────────────────────────────────────────

type TabId = 'info' | 'household' | 'timeline' | 'groups' | 'notes';

const TABS: { id: TabId; label: string }[] = [
  { id: 'info',      label: 'Info' },
  { id: 'household', label: 'Household' },
  { id: 'timeline',  label: 'Timeline' },
  { id: 'groups',    label: 'Groups' },
  { id: 'notes',     label: 'Notes' },
];

// ── Props ─────────────────────────────────────────────────────────────────────

type MemberProfileDrawerProps = {
  member:     Member | null;
  allMembers: Member[];
  onClose:    () => void;
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
  const closeRef = useRef<HTMLButtonElement>(null);
  const isOpen   = Boolean(member);

  // Reset to Info tab on each new member
  useEffect(() => {
    if (member) setActiveTab('info');
  }, [member?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Focus close button on open
  useEffect(() => {
    if (isOpen) closeRef.current?.focus();
  }, [isOpen]);

  // Escape closes
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const statusCfg = member ? STATUS_CONFIG[member.status] : null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="mpd-backdrop" onClick={onClose} aria-hidden="true" />
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
            {/* ── Header ───────────────────────────────────────────── */}
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

              {/* Quick actions */}
              <div className="mpd-header__actions" role="group" aria-label="Quick actions">

                {/* Email */}
                <a
                  href={`mailto:${member.email}`}
                  className="mpd-action-btn"
                  aria-label={`Email ${member.fullName}`}
                  title="Send email"
                >
                  <Mail size={15} />
                  <span>Email</span>
                </a>

                {/* Call */}
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

                {/* WhatsApp */}
                {member.phone && (
                  <a
                    href={whatsappUrl(member.phone)}
                    className="mpd-action-btn mpd-action-btn--whatsapp"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`WhatsApp ${member.fullName}`}
                    title="WhatsApp"
                  >
                    {/* WhatsApp icon via inline SVG — no extra dependency */}
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <span>WhatsApp</span>
                  </a>
                )}

                {/* Add Note — jumps to Notes tab */}
                <button
                  type="button"
                  className="mpd-action-btn"
                  aria-label="Add pastoral note"
                  title="Add Note"
                  onClick={() => setActiveTab('notes')}
                >
                  <FileText size={15} />
                  <span>Note</span>
                </button>

                {/* Prayer Request — jumps to Notes tab (prayer variant) */}
                <button
                  type="button"
                  className="mpd-action-btn mpd-action-btn--prayer"
                  aria-label="Add prayer request"
                  title="Prayer Request"
                  onClick={() => setActiveTab('notes')}
                >
                  <Heart size={15} />
                  <span>Prayer</span>
                </button>

                {/* Message (future integration) */}
                <button
                  type="button"
                  className="mpd-action-btn"
                  aria-label="Send in-app message"
                  title="Message"
                  onClick={() => {/* messaging — future sprint */}}
                >
                  <MessageCircle size={15} />
                  <span>Message</span>
                </button>

                {/* Activate / Deactivate */}
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

            {/* ── Tab bar ───────────────────────────────────────────── */}
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

            {/* ── Tab panels ────────────────────────────────────────── */}
            <div className="mpd-body">

              <div id="mpd-panel-info" role="tabpanel" hidden={activeTab !== 'info'}>
                <MemberInfoTab member={member} />
              </div>

              <div id="mpd-panel-household" role="tabpanel" hidden={activeTab !== 'household'}>
                <MemberHouseholdTab
                  member={member}
                  allMembers={allMembers}
                  onSelectMember={onNavigate}
                />
              </div>

              <div id="mpd-panel-timeline" role="tabpanel" hidden={activeTab !== 'timeline'}>
                <MemberTimelineTab member={member} />
              </div>

              <div id="mpd-panel-groups" role="tabpanel" hidden={activeTab !== 'groups'}>
                <MemberGroupsTab member={member} />
              </div>

              <div id="mpd-panel-notes" role="tabpanel" hidden={activeTab !== 'notes'}>
                <MemberNotesTab member={member} />
              </div>

            </div>
          </>
        )}
      </aside>
    </>
  );
}

export default MemberProfileDrawer;
