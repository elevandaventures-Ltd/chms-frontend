'use client';

import { Mail, Phone, MapPin, Calendar, Tag, Users, Briefcase } from 'lucide-react';
import type { Member } from '@/lib/site';

const AGE_GROUP_LABELS: Record<string, string> = {
  child:       'Child (0–12)',
  youth:       'Youth (13–17)',
  young_adult: 'Young Adult (18–35)',
  adult:       'Adult (36–59)',
  senior:      'Senior (60+)',
};

const ROLE_LABELS: Record<string, string> = {
  admin:           'Admin',
  pastor:          'Pastor',
  finance:         'Finance',
  ministry_leader: 'Ministry Leader',
  staff:           'Staff',
  member:          'Member',
};

type FieldRowProps = { icon: React.ReactNode; label: string; value?: string | null };

function FieldRow({ icon, label, value }: FieldRowProps) {
  return (
    <div className="mpd-info__row">
      <span className="mpd-info__row-icon" aria-hidden="true">{icon}</span>
      <div className="mpd-info__row-copy">
        <span className="mpd-info__row-label">{label}</span>
        <span className="mpd-info__row-value">{value || <em className="mpd-info__row-empty">Not provided</em>}</span>
      </div>
    </div>
  );
}

type MemberInfoTabProps = { member: Member };

export function MemberInfoTab({ member }: MemberInfoTabProps) {
  return (
    <div className="mpd-info">

      {/* Contact */}
      <section className="mpd-info__section">
        <h4 className="mpd-info__section-title">Contact</h4>
        <FieldRow icon={<Mail size={14} />} label="Email" value={member.email} />
        <FieldRow icon={<Phone size={14} />} label="Phone" value={member.phone} />
      </section>

      {/* Church details */}
      <section className="mpd-info__section">
        <h4 className="mpd-info__section-title">Church Details</h4>
        <FieldRow
          icon={<Briefcase size={14} />}
          label="Role"
          value={ROLE_LABELS[member.role] ?? member.role}
        />
        <FieldRow
          icon={<Calendar size={14} />}
          label="Member since"
          value={new Date(member.joinedDate).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric',
          })}
        />
        <FieldRow
          icon={<Users size={14} />}
          label="Age group"
          value={member.ageGroup ? AGE_GROUP_LABELS[member.ageGroup] : null}
        />
        <FieldRow
          icon={<MapPin size={14} />}
          label="Geographic zone"
          value={member.zone}
        />
      </section>

      {/* Ministries */}
      <section className="mpd-info__section">
        <h4 className="mpd-info__section-title">Ministry Teams</h4>
        {member.ministries.length > 0 ? (
          <div className="mpd-info__tags">
            {member.ministries.map((m) => (
              <span key={m} className="mpd-info__tag">
                <Tag size={10} aria-hidden="true" /> {m}
              </span>
            ))}
          </div>
        ) : (
          <p className="mpd-info__empty">Not assigned to any ministry team.</p>
        )}
      </section>

      {/* Notes */}
      {member.notes && (
        <section className="mpd-info__section">
          <h4 className="mpd-info__section-title">Notes</h4>
          <p className="mpd-info__notes">{member.notes}</p>
        </section>
      )}
    </div>
  );
}
