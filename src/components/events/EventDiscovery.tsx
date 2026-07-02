'use client';

/**
 * EventDiscovery — Day 28 member-facing event cards with RSVP.
 */
import { useCallback, useEffect, useState } from 'react';
import { MapPin, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';
import { EVENT_TYPE_LABELS, EVENT_TYPE_COLOURS, mockEvents, type ChmsEvent } from '@/lib/events';
import { EventDetailModal } from '@/components/events/EventDetailModal';

export function EventDiscovery() {
  const [events,   setEvents]   = useState<ChmsEvent[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState<ChmsEvent | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/events');
      const json = await res.json() as { data?: ChmsEvent[] };
      setEvents((json.data ?? mockEvents).map((e) => ({ ...e, start: new Date(e.start), end: new Date(e.end) })));
    } catch {
      setEvents(mockEvents);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const upcoming = events
    .filter((e) => e.end >= new Date())
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  return (
    <div className="event-discovery">
      <h2 className="event-discovery__heading">Upcoming Events</h2>

      {loading ? (
        <div className="event-cards-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="event-card event-card--skeleton">
              <div className="skeleton-shimmer" style={{ height: '140px', borderRadius: '14px 14px 0 0' }} />
              <div style={{ padding: '16px', display: 'grid', gap: '8px' }}>
                <div className="skeleton-shimmer skeleton-line skeleton-line--name" />
                <div className="skeleton-shimmer skeleton-line skeleton-line--email" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="event-cards-grid">
          {upcoming.map((ev) => {
            const colour    = EVENT_TYPE_COLOURS[ev.type];
            const spotsLeft = ev.capacity != null ? ev.capacity - ev.rsvpCount : null;
            const isFull    = spotsLeft != null && spotsLeft <= 0;

            return (
              <button
                key={ev.id}
                type="button"
                className="event-card"
                onClick={() => setSelected(ev)}
                aria-label={`View ${ev.title}`}
              >
                {/* Colour header */}
                <div className="event-card__header" style={{ background: colour }}>
                  <span className="event-card__type">{EVENT_TYPE_LABELS[ev.type]}</span>
                </div>

                <div className="event-card__body">
                  <h3 className="event-card__title">{ev.title}</h3>

                  <div className="event-card__meta">
                    <span><Clock size={12} aria-hidden="true" /> {format(ev.start, 'EEE d MMM · h:mm a')}</span>
                    {ev.location && <span><MapPin size={12} aria-hidden="true" /> {ev.location}</span>}
                    <span>
                      <Users size={12} aria-hidden="true" />
                      {ev.rsvpCount}{ev.capacity ? ` / ${ev.capacity}` : ''} going
                    </span>
                  </div>

                  <div className="event-card__rsvp-row">
                    {isFull ? (
                      <span className="event-card__full-badge">Full — join waitlist</span>
                    ) : spotsLeft != null && spotsLeft <= 10 ? (
                      <span className="event-card__spots">{spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left</span>
                    ) : null}
                    <span className="event-card__rsvp-cta" style={{ color: colour }}>RSVP →</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selected && (
        <EventDetailModal event={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

export default EventDiscovery;
