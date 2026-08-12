'use client';

/**
 * EventDetailModal — Days 26+28
 *
 * Shows event info and RSVP flow:
 *   Click RSVP → confirm modal → "You're going!" or "Added to waitlist" toast
 */
import { useState } from 'react';
import { X, MapPin, Clock, Users, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { EVENT_TYPE_LABELS, EVENT_TYPE_COLOURS, type ChmsEvent } from '@/lib/events';

type Props = {
  event:    ChmsEvent;
  onClose:  () => void;
  onRsvp?:  () => void;
};

export function EventDetailModal({ event, onClose, onRsvp }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [rsvping,    setRsvping]    = useState(false);
  const [rsvped,     setRsvped]     = useState(false);

  const isFull     = event.capacity != null && event.rsvpCount >= event.capacity;
  const spotsLeft  = event.capacity != null ? event.capacity - event.rsvpCount : null;
  const typeColour = EVENT_TYPE_COLOURS[event.type];

  async function confirmRsvp() {
    setRsvping(true);
    try {
      const res  = await fetch(`/api/events/${event.id}/rsvp`, { method: 'POST' });
      const json = await res.json() as { status?: string; position?: number };

      if (json.status === 'waitlisted') {
        toast(`Added to waitlist — position #${json.position ?? '?'}`);
      } else {
        toast.success("You're going! See you there.");
      }
      setRsvped(true);
      setConfirming(false);
      onRsvp?.();
    } catch {
      toast.error('Could not save your RSVP. Please try again.');
    } finally {
      setRsvping(false);
    }
  }

  return (
    <div className="ui-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="event-detail-modal" role="dialog" aria-modal="true" aria-label={event.title}>
        {/* Colour header strip */}
        <div className="event-detail-modal__strip" style={{ background: typeColour }}>
          <span className="event-detail-modal__type">{EVENT_TYPE_LABELS[event.type]}</span>
          <button type="button" className="event-detail-modal__close" onClick={onClose} aria-label="Close">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="event-detail-modal__body">
          <h2 className="event-detail-modal__title">{event.title}</h2>

          <div className="event-detail-modal__meta">
            <span><CalendarDays size={14} aria-hidden="true" /> {format(event.start, 'EEE, d MMM yyyy')}</span>
            <span><Clock size={14} aria-hidden="true" /> {format(event.start, 'h:mm a')} – {format(event.end, 'h:mm a')}</span>
            {event.location && <span><MapPin size={14} aria-hidden="true" /> {event.location}</span>}
            <span>
              <Users size={14} aria-hidden="true" />
              {event.rsvpCount} {event.capacity ? `/ ${event.capacity}` : ''} going
              {spotsLeft != null && spotsLeft <= 10 && spotsLeft > 0 && (
                <span className="event-detail-modal__spots"> · {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left</span>
              )}
            </span>
          </div>

          {event.description && <p className="event-detail-modal__desc">{event.description}</p>}

          {/* RSVP / confirm */}
          {!rsvped && !confirming && (
            <Button
              size="lg"
              fullWidth
              variant={isFull ? 'secondary' : 'primary'}
              onClick={() => setConfirming(true)}
            >
              {isFull ? 'Join waitlist' : 'RSVP — I\'m going'}
            </Button>
          )}

          {confirming && (
            <div className="event-rsvp-confirm" role="alertdialog" aria-label="Confirm RSVP">
              <p>
                {isFull
                  ? `This event is full. You'll be added to the waitlist.`
                  : `Confirm your RSVP for ${event.title}?`}
              </p>
              <div className="event-rsvp-confirm__btns">
                <Button variant="secondary" size="md" onClick={() => setConfirming(false)} disabled={rsvping}>Cancel</Button>
                <Button size="md" loading={rsvping} onClick={() => void confirmRsvp()}>
                  {isFull ? 'Join waitlist' : 'Confirm'}
                </Button>
              </div>
            </div>
          )}

          {rsvped && (
            <p className="event-rsvp-done" role="status">
              ✓ You&apos;re registered for this event.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventDetailModal;
