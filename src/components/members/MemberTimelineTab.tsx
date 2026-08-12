'use client';

import { Calendar, UserPlus, Users, FileText, Heart, Star, MessageSquare } from 'lucide-react';
import type { Member } from '@/lib/site';

// ── Types ─────────────────────────────────────────────────────────────────────

export type TimelineEventType =
  | 'joined'
  | 'group_joined'
  | 'note_added'
  | 'prayer_request'
  | 'status_change'
  | 'milestone';

export type TimelineEvent = {
  id: string;
  type: TimelineEventType;
  date: string;        // ISO date string
  title: string;
  detail?: string;
  actor?: string;      // who recorded this
};

// ── Mock generator — deterministic from member data ──────────────────────────

function getMockTimeline(member: Member): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const joined = new Date(member.joinedDate);

  // Always: joined event
  events.push({
    id:    `${member.id}-joined`,
    type:  'joined',
    date:  member.joinedDate,
    title: 'Joined the church',
    detail: `Registered as ${member.role.replace('_', ' ')}.`,
  });

  // Ministry group joins (one per ministry, offset by weeks)
  member.ministries.forEach((ministry, i) => {
    const d = new Date(joined);
    d.setDate(d.getDate() + (i + 1) * 14);
    events.push({
      id:    `${member.id}-group-${i}`,
      type:  'group_joined',
      date:  d.toISOString().slice(0, 10),
      title: `Joined ${ministry}`,
      detail: `Added to ${ministry} team.`,
      actor: 'Admin',
    });
  });

  // Mock pastoral note ~6 months after joining
  const noteDate = new Date(joined);
  noteDate.setMonth(noteDate.getMonth() + 6);
  events.push({
    id:    `${member.id}-note-1`,
    type:  'note_added',
    date:  noteDate.toISOString().slice(0, 10),
    title: 'Pastoral note recorded',
    detail: 'Follow-up after Sunday service — doing well, expressed interest in leadership.',
    actor: 'Pastor Mensah',
  });

  // Mock prayer request ~1 year after joining
  const prayerDate = new Date(joined);
  prayerDate.setFullYear(prayerDate.getFullYear() + 1);
  events.push({
    id:    `${member.id}-prayer-1`,
    type:  'prayer_request',
    date:  prayerDate.toISOString().slice(0, 10),
    title: 'Prayer request submitted',
    detail: 'Family healing and career guidance.',
    actor: member.fullName,
  });

  // For active members: milestone at 2 years
  if (member.status === 'active') {
    const milestoneDate = new Date(joined);
    milestoneDate.setFullYear(milestoneDate.getFullYear() + 2);
    if (milestoneDate <= new Date()) {
      events.push({
        id:    `${member.id}-milestone-2yr`,
        type:  'milestone',
        date:  milestoneDate.toISOString().slice(0, 10),
        title: '2-year membership milestone',
        actor: 'System',
      });
    }
  }

  // Sort newest first
  return events.sort((a, b) => b.date.localeCompare(a.date));
}

// ── Icon + colour per event type ─────────────────────────────────────────────

const EVENT_CONFIG: Record<TimelineEventType, { icon: React.ReactNode; cls: string }> = {
  joined:        { icon: <UserPlus size={13} />,      cls: 'mpd-timeline__dot--joined' },
  group_joined:  { icon: <Users size={13} />,         cls: 'mpd-timeline__dot--group' },
  note_added:    { icon: <FileText size={13} />,      cls: 'mpd-timeline__dot--note' },
  prayer_request:{ icon: <Heart size={13} />,         cls: 'mpd-timeline__dot--prayer' },
  status_change: { icon: <Calendar size={13} />,      cls: 'mpd-timeline__dot--status' },
  milestone:     { icon: <Star size={13} />,          cls: 'mpd-timeline__dot--milestone' },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

type MemberTimelineTabProps = { member: Member };

export function MemberTimelineTab({ member }: MemberTimelineTabProps) {
  const events = getMockTimeline(member);

  if (events.length === 0) {
    return (
      <div className="mpd-timeline__empty">
        <MessageSquare size={28} strokeWidth={1.5} />
        <p>No interactions recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="mpd-timeline">
      <p className="mpd-timeline__hint">
        Chronological history of interactions, group joins, and milestones.{' '}
        <em>Live data requires Supabase integration.</em>
      </p>

      <ol className="mpd-timeline__list" aria-label="Member timeline">
        {events.map((ev) => {
          const cfg = EVENT_CONFIG[ev.type];
          return (
            <li key={ev.id} className="mpd-timeline__item">
              {/* Dot */}
              <span className={`mpd-timeline__dot ${cfg.cls}`} aria-hidden="true">
                {cfg.icon}
              </span>

              {/* Content */}
              <div className="mpd-timeline__content">
                <div className="mpd-timeline__row">
                  <span className="mpd-timeline__title">{ev.title}</span>
                  <time className="mpd-timeline__date" dateTime={ev.date}>
                    {formatDate(ev.date)}
                  </time>
                </div>
                {ev.detail && <p className="mpd-timeline__detail">{ev.detail}</p>}
                {ev.actor && (
                  <span className="mpd-timeline__actor">by {ev.actor}</span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
