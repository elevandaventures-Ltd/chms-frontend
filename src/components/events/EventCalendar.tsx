'use client';

/**
 * EventCalendar — Day 26
 *
 * Full-screen event calendar using react-big-calendar.
 * Month / Week / Day views with colour-coded event types.
 * Click an event to view details / RSVP.
 */
import { useCallback, useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer, type View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
  mockEvents, EVENT_TYPE_COLOURS, EVENT_TYPE_LABELS,
  type ChmsEvent, type EventType,
} from '@/lib/events';
import { EventDetailModal } from '@/components/events/EventDetailModal';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales: { 'en-US': enUS },
});

type CalEvent = {
  id:       string;
  title:    string;
  start:    Date;
  end:      Date;
  resource: ChmsEvent;
};

function toCalEvent(e: ChmsEvent): CalEvent {
  return { id: e.id, title: e.title, start: e.start, end: e.end, resource: e };
}

export function EventCalendar() {
  const [events,  setEvents]  = useState<ChmsEvent[]>([]);
  const [view,    setView]    = useState<View>('month');
  const [date,    setDate]    = useState(new Date());
  const [selected,setSelected]= useState<ChmsEvent | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/events');
      const json = await res.json() as { data?: ChmsEvent[] };
      setEvents((json.data ?? mockEvents).map((e) => ({
        ...e,
        start: new Date(e.start),
        end:   new Date(e.end),
      })));
    } catch {
      setEvents(mockEvents);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  function eventStyleGetter(event: CalEvent) {
    const type  = event.resource.type as EventType;
    const color = EVENT_TYPE_COLOURS[type] ?? '#b25131';
    return {
      style: {
        backgroundColor: color,
        borderColor:     color,
        color:           '#fff',
        borderRadius:    '6px',
        fontSize:        '0.78rem',
        padding:         '2px 6px',
      },
    };
  }

  return (
    <div className="event-calendar-wrap">
      {/* Legend */}
      <div className="event-legend" aria-label="Event type legend">
        {Object.entries(EVENT_TYPE_LABELS).map(([type, label]) => (
          <span key={type} className="event-legend__item">
            <span
              className="event-legend__dot"
              style={{ background: EVENT_TYPE_COLOURS[type as EventType] }}
              aria-hidden="true"
            />
            {label}
          </span>
        ))}
      </div>

      {loading ? (
        <div className="event-calendar-skeleton" aria-busy="true">
          <div className="skeleton-shimmer" style={{ height: '500px', borderRadius: '16px' }} />
        </div>
      ) : (
        <div className="event-calendar-container">
          <Calendar
            localizer={localizer}
            events={events.map(toCalEvent)}
            startAccessor="start"
            endAccessor="end"
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={(e) => setSelected(e.resource)}
            popup
            style={{ height: 640 }}
          />
        </div>
      )}

      {selected && (
        <EventDetailModal
          event={selected}
          onClose={() => setSelected(null)}
          onRsvp={() => setSelected(null)}
        />
      )}
    </div>
  );
}

export default EventCalendar;
