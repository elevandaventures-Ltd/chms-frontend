'use client';

/**
 * EventDetailPage — Day 30
 *
 * Full event detail view (replaces the simple modal for admin).
 * Sections:
 *   - Header: colour strip, title, type badge, quick meta
 *   - Add to Calendar: Google, Apple (iCal), Outlook, iCal download
 *   - Share: copy link button
 *   - Description
 *   - Custom registration fields (read-only preview)
 *   - Attendee list with status badges + search
 */
import { useState } from 'react';
import {
  X, MapPin, Clock, Users, CalendarDays, Link2,
  Check, Download, ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import {
  EVENT_TYPE_LABELS, EVENT_TYPE_COLOURS,
  type ChmsEvent, type Attendee,
} from '@/lib/events';

// ── iCal helpers ──────────────────────────────────────────────────────────────

function icalDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function buildIcal(event: ChmsEvent): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Elevanda ChMS//EN',
    'BEGIN:VEVENT',
    `UID:${event.id}@elevanda.chms`,
    `DTSTAMP:${icalDate(new Date())}`,
    `DTSTART:${icalDate(event.start)}`,
    `DTEND:${icalDate(event.end)}`,
    `SUMMARY:${event.title}`,
    event.description ? `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}` : '',
    event.location    ? `LOCATION:${event.location}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean);
  return lines.join('\r\n');
}

function downloadIcal(event: ChmsEvent) {
  const blob = new Blob([buildIcal(event)], { type: 'text/calendar;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${event.title.replace(/\s+/g, '-').toLowerCase()}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Calendar link builders ────────────────────────────────────────────────────

function googleCalUrl(event: ChmsEvent): string {
  const p = new URLSearchParams({
    action:   'TEMPLATE',
    text:     event.title,
    dates:    `${icalDate(event.start)}/${icalDate(event.end)}`,
    details:  event.description ?? '',
    location: event.location ?? '',
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

function outlookUrl(event: ChmsEvent): string {
  const p = new URLSearchParams({
    path:      '/calendar/action/compose',
    rru:       'addevent',
    subject:   event.title,
    startdt:   event.start.toISOString(),
    enddt:     event.end.toISOString(),
    body:      event.description ?? '',
    location:  event.location ?? '',
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${p.toString()}`;
}

// ── Attendee status badge ─────────────────────────────────────────────────────

const ATTENDEE_STATUS: Record<Attendee['status'], { label: string; cls: string }> = {
  going:       { label: 'Going',       cls: 'edp-attendee__status--going' },
  waitlisted:  { label: 'Waitlisted',  cls: 'edp-attendee__status--waitlisted' },
  cancelled:   { label: 'Cancelled',   cls: 'edp-attendee__status--cancelled' },
};

function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

const AVATAR_COLOURS = ['#b25131','#274c3f','#2563eb','#7c3aed','#0891b2','#d97706'];
function avatarColour(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLOURS[Math.abs(h) % AVATAR_COLOURS.length];
}

// ── Props ─────────────────────────────────────────────────────────────────────

type EventDetailPageProps = {
  event:   ChmsEvent;
  onClose: () => void;
  onEdit?: () => void;
};

// ── Component ─────────────────────────────────────────────────────────────────

export function EventDetailPage({ event, onClose, onEdit }: EventDetailPageProps) {
  const [attendeeSearch, setAttendeeSearch] = useState('');
  const [copied, setCopied] = useState(false);

  const typeColour = EVENT_TYPE_COLOURS[event.type];
  const spotsLeft  = event.capacity != null ? event.capacity - event.rsvpCount : null;

  const attendees = (event.attendees ?? []).filter((a) =>
    !attendeeSearch || a.name.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
    a.email.toLowerCase().includes(attendeeSearch.toLowerCase()),
  );

  const goingCount      = (event.attendees ?? []).filter((a) => a.status === 'going').length;
  const waitlistedCount = (event.attendees ?? []).filter((a) => a.status === 'waitlisted').length;

  async function copyShareLink() {
    const url = `${window.location.origin}/events/${event.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy link');
    }
  }

  return (
    <div className="edp-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="edp" role="dialog" aria-modal="true" aria-label={event.title}>

        {/* ── Colour header strip ─────────────────────────────────── */}
        <div className="edp__strip" style={{ background: typeColour }}>
          <span className="edp__type-badge">{EVENT_TYPE_LABELS[event.type]}</span>
          <div className="edp__strip-actions">
            {onEdit && (
              <button type="button" className="edp__strip-btn" onClick={onEdit}>
                Edit
              </button>
            )}
            <button type="button" className="edp__strip-btn edp__strip-btn--close" onClick={onClose} aria-label="Close">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Scrollable body ─────────────────────────────────────── */}
        <div className="edp__body">

          {/* Title + meta */}
          <div className="edp__hero">
            <h2 className="edp__title">{event.title}</h2>
            <div className="edp__meta">
              <span><CalendarDays size={14} aria-hidden="true" /> {format(event.start, 'EEEE, d MMMM yyyy')}</span>
              <span><Clock size={14} aria-hidden="true" /> {format(event.start, 'h:mm a')} – {format(event.end, 'h:mm a')}</span>
              {event.location && <span><MapPin size={14} aria-hidden="true" /> {event.location}</span>}
              <span>
                <Users size={14} aria-hidden="true" />
                {event.rsvpCount}{event.capacity ? ` / ${event.capacity}` : ''} registered
                {spotsLeft != null && spotsLeft > 0 && spotsLeft <= 20 && (
                  <span className="edp__spots"> · {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left</span>
                )}
              </span>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <section className="edp__section">
              <h3 className="edp__section-title">About this event</h3>
              <p className="edp__desc">{event.description}</p>
            </section>
          )}

          {/* ── Add to Calendar ─────────────────────────────────── */}
          <section className="edp__section">
            <h3 className="edp__section-title">Add to Calendar</h3>
            <div className="edp__cal-grid">

              <a
                href={googleCalUrl(event)}
                target="_blank"
                rel="noopener noreferrer"
                className="edp__cal-btn"
              >
                {/* Google Calendar colour icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <rect width="24" height="24" rx="4" fill="#fff" stroke="#dadce0" strokeWidth="1"/>
                  <rect x="3" y="3" width="18" height="18" rx="2" fill="#fff"/>
                  <path d="M3 8h18v2H3z" fill="#4285f4"/>
                  <text x="12" y="18" textAnchor="middle" fontSize="8" fontWeight="700" fill="#1a73e8">
                    {format(event.start, 'd')}
                  </text>
                </svg>
                <span>Google Calendar</span>
                <ChevronRight size={13} className="edp__cal-btn-arrow" />
              </a>

              <button
                type="button"
                className="edp__cal-btn"
                onClick={() => downloadIcal(event)}
                title="Download .ics for Apple Calendar"
              >
                {/* Apple-style icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <rect width="24" height="24" rx="4" fill="#f5f5f7"/>
                  <path d="M12 4a4 4 0 014 4H8a4 4 0 014-4z" fill="#1d1d1f"/>
                  <rect x="4" y="8" width="16" height="12" rx="2" fill="#fff" stroke="#d2d2d7" strokeWidth="1"/>
                  <text x="12" y="17" textAnchor="middle" fontSize="7" fontWeight="700" fill="#1d1d1f">
                    {format(event.start, 'd')}
                  </text>
                </svg>
                <span>Apple Calendar</span>
                <ChevronRight size={13} className="edp__cal-btn-arrow" />
              </button>

              <a
                href={outlookUrl(event)}
                target="_blank"
                rel="noopener noreferrer"
                className="edp__cal-btn"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <rect width="24" height="24" rx="4" fill="#0078d4"/>
                  <text x="12" y="16" textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff">OL</text>
                </svg>
                <span>Outlook</span>
                <ChevronRight size={13} className="edp__cal-btn-arrow" />
              </a>

              <button
                type="button"
                className="edp__cal-btn"
                onClick={() => downloadIcal(event)}
              >
                <Download size={18} aria-hidden="true" />
                <span>Download .ics</span>
                <ChevronRight size={13} className="edp__cal-btn-arrow" />
              </button>

            </div>
          </section>

          {/* ── Share ───────────────────────────────────────────── */}
          <section className="edp__section">
            <h3 className="edp__section-title">Share Event</h3>
            <div className="edp__share-row">
              <span className="edp__share-url">
                {typeof window !== 'undefined' ? `${window.location.origin}/events/${event.id}` : `/events/${event.id}`}
              </span>
              <button
                type="button"
                className={`edp__copy-btn${copied ? ' edp__copy-btn--copied' : ''}`}
                onClick={() => void copyShareLink()}
              >
                {copied ? <Check size={14} /> : <Link2 size={14} />}
                {copied ? 'Copied!' : 'Copy link'}
              </button>
            </div>
          </section>

          {/* ── Custom registration fields preview ──────────────── */}
          {event.customFields && event.customFields.length > 0 && (
            <section className="edp__section">
              <h3 className="edp__section-title">Registration Form Fields</h3>
              <div className="edp__fields-preview">
                {event.customFields.map((f) => (
                  <div key={f.id} className="edp__field-row">
                    <span className="edp__field-type">{f.type}</span>
                    <span className="edp__field-label">
                      {f.label}
                      {f.required && <span className="edp__field-required"> *</span>}
                    </span>
                    {f.type === 'dropdown' && f.options && (
                      <span className="edp__field-options">{f.options.join(' · ')}</span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Attendee list ────────────────────────────────────── */}
          <section className="edp__section">
            <div className="edp__attendees-header">
              <h3 className="edp__section-title">
                Attendees
                <span className="edp__attendees-counts">
                  <span className="edp__count edp__count--going">{goingCount} going</span>
                  {waitlistedCount > 0 && (
                    <span className="edp__count edp__count--waitlisted">{waitlistedCount} waitlisted</span>
                  )}
                </span>
              </h3>
              <input
                className="edp__attendee-search"
                placeholder="Search attendees…"
                value={attendeeSearch}
                onChange={(e) => setAttendeeSearch(e.target.value)}
                aria-label="Search attendees"
              />
            </div>

            {attendees.length === 0 ? (
              <p className="edp__attendees-empty">
                {attendeeSearch ? 'No attendees match your search.' : 'No attendees yet.'}
              </p>
            ) : (
              <ul className="edp__attendees-list" aria-label="Attendee list">
                {attendees.map((a) => {
                  const sc = ATTENDEE_STATUS[a.status];
                  return (
                    <li key={a.id} className="edp-attendee">
                      <div
                        className="edp-attendee__avatar"
                        style={{ background: avatarColour(a.name) }}
                        aria-hidden="true"
                      >
                        {initials(a.name)}
                      </div>
                      <div className="edp-attendee__copy">
                        <span className="edp-attendee__name">{a.name}</span>
                        <span className="edp-attendee__email">{a.email}</span>
                      </div>
                      <span className={`edp-attendee__status ${sc.cls}`}>{sc.label}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Close footer */}
          <div className="edp__footer">
            <Button variant="secondary" size="md" onClick={onClose}>Close</Button>
            {onEdit && <Button size="md" onClick={onEdit}>Edit event</Button>}
          </div>

        </div>
      </div>
    </div>
  );
}

export default EventDetailPage;
