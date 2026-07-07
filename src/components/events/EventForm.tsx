'use client';

/**
 * EventForm — Day 27
 *
 * Creates or edits a church event.
 * Fields: title, description, type, start/end datetime, location, capacity.
 * Recurrence: None / Daily / Weekly (day checkboxes) / Monthly / Custom (rrule).
 */
import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { CustomFieldsBuilder } from '@/components/events/CustomFieldsBuilder';
import {
  EVENT_TYPES, EVENT_TYPE_LABELS,
  type ChmsEvent, type EventType, type RecurrencePattern, type CustomField,
} from '@/lib/events';

const DAYS_OF_WEEK = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function pad(n: number) { return String(n).padStart(2,'0'); }
function localDatetime(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type EventFormProps = {
  initial?: Partial<ChmsEvent>;
  onSaved:  (event: ChmsEvent) => void;
  onCancel: () => void;
};

export function EventForm({ initial, onSaved, onCancel }: EventFormProps) {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  const later = new Date(now); later.setHours(later.getHours() + 2);

  const [title,       setTitle]      = useState(initial?.title ?? '');
  const [description, setDesc]       = useState(initial?.description ?? '');
  const [type,        setType]       = useState<EventType>(initial?.type ?? 'worship');
  const [start,       setStart]      = useState(localDatetime(initial?.start ?? now));
  const [end,         setEnd]        = useState(localDatetime(initial?.end   ?? later));
  const [location,    setLocation]   = useState(initial?.location ?? '');
  const [capacity,    setCapacity]   = useState(String(initial?.capacity ?? ''));
  const [recType,     setRecType]    = useState<RecurrencePattern['type']>(initial?.recurrence?.type ?? 'none');
  const [recDays,     setRecDays]    = useState<number[]>(
    initial?.recurrence?.type === 'weekly' ? initial.recurrence.days : [],
  );
  const [recDom,      setRecDom]     = useState(
    initial?.recurrence?.type === 'monthly' ? String(initial.recurrence.dayOfMonth) : '1',
  );
  const [rrule,       setRrule]      = useState(
    initial?.recurrence?.type === 'custom' ? initial.recurrence.rrule : '',
  );
  const [customFields, setCustomFields] = useState<CustomField[]>(initial?.customFields ?? []);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  function buildRecurrence(): RecurrencePattern {
    if (recType === 'weekly')  return { type: 'weekly',  days: recDays };
    if (recType === 'monthly') return { type: 'monthly', dayOfMonth: parseInt(recDom, 10) || 1 };
    if (recType === 'custom')  return { type: 'custom',  rrule };
    if (recType === 'daily')   return { type: 'daily' };
    return { type: 'none' };
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required.'); return; }
    if (end <= start)  { setError('End time must be after start time.'); return; }

    setSaving(true); setError('');
    const body = {
      title: title.trim(), description: description.trim() || undefined,
      type, start, end, location: location.trim() || undefined,
      capacity: capacity ? parseInt(capacity, 10) : undefined,
      recurrence: buildRecurrence(),
      customFields,
    };

    try {
      const res  = await fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const json = await res.json() as { data?: ChmsEvent; error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Failed to save event.');
      onSaved(json.data ?? { ...body, id: `ev-${Date.now()}`, start: new Date(start), end: new Date(end), rsvpCount: 0 } as ChmsEvent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save event.');
    } finally {
      setSaving(false);
    }
  }

  function toggleDay(d: number) {
    setRecDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
  }

  return (
    <div className="event-form-overlay" role="dialog" aria-modal="true" aria-label="Create event">
      <div className="event-form-panel">
        <div className="event-form-panel__head">
          <h2>{initial?.id ? 'Edit event' : 'Create event'}</h2>
          <button type="button" className="msm-close" onClick={onCancel} aria-label="Close"><X size={16} /></button>
        </div>

        {error && <Alert variant="destructive" onClose={() => setError('')}>{error}</Alert>}

        <form className="event-form" onSubmit={handleSubmit} noValidate>
          {/* Title */}
          <label className="amf-field">
            <span className="amf-label">Title *</span>
            <input className="amf-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" maxLength={120} required />
          </label>

          {/* Type */}
          <div className="amf-field">
            <span className="amf-label">Event type</span>
            <div className="event-type-grid" role="radiogroup">
              {EVENT_TYPES.map((t) => (
                <button key={t} type="button" role="radio" aria-checked={type === t ? 'true' : 'false'}
                  className={`event-type-btn${type === t ? ' event-type-btn--active' : ''}`}
                  style={type === t ? { '--dot-color': '#fff' } as React.CSSProperties : {}}
                  onClick={() => setType(t)}
                >
                  <span className="event-type-btn__dot" style={{ background: type === t ? '#fff' : require('@/lib/events').EVENT_TYPE_COLOURS[t] }} aria-hidden="true" />
                  {EVENT_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Start / End */}
          <div className="amf-row">
            <label className="amf-field">
              <span className="amf-label">Start *</span>
              <input type="datetime-local" className="amf-input" value={start} onChange={(e) => setStart(e.target.value)} required />
            </label>
            <label className="amf-field">
              <span className="amf-label">End *</span>
              <input type="datetime-local" className="amf-input" value={end} min={start} onChange={(e) => setEnd(e.target.value)} required />
            </label>
          </div>

          {/* Location + Capacity */}
          <div className="amf-row">
            <label className="amf-field">
              <span className="amf-label">Location</span>
              <input className="amf-input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Room, venue…" />
            </label>
            <label className="amf-field">
              <span className="amf-label">Capacity</span>
              <input type="number" min="1" className="amf-input" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="Leave blank for unlimited" />
            </label>
          </div>

          {/* Description */}
          <label className="amf-field">
            <span className="amf-label">Description</span>
            <textarea className="amf-input amf-textarea" value={description} onChange={(e) => setDesc(e.target.value)} placeholder="Optional description…" rows={3} />
          </label>

          {/* Recurrence */}
          <div className="amf-field">
            <span className="amf-label">Recurrence</span>
            <div className="rec-tabs" role="tablist">
              {(['none','daily','weekly','monthly','custom'] as const).map((r) => (
                <button key={r} type="button" role="tab" aria-selected={recType === r ? 'true' : 'false'}
                  className={`rec-tab${recType === r ? ' rec-tab--active' : ''}`}
                  onClick={() => setRecType(r)}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>

            {recType === 'weekly' && (
              <div className="rec-days" role="group" aria-label="Days of week">
                {DAYS_OF_WEEK.map((d, i) => (
                  <button key={d} type="button"
                    className={`rec-day${recDays.includes(i) ? ' rec-day--active' : ''}`}
                    aria-pressed={recDays.includes(i)}
                    onClick={() => toggleDay(i)}>
                    {d}
                  </button>
                ))}
              </div>
            )}

            {recType === 'monthly' && (
              <div className="rec-monthly">
                <label className="amf-label" htmlFor="rec-dom">Day of month</label>
                <input id="rec-dom" type="number" min="1" max="31" className="amf-input rec-dom-input" value={recDom} onChange={(e) => setRecDom(e.target.value)} />
              </div>
            )}

            {recType === 'custom' && (
              <label className="amf-field">
                <span className="amf-label">RRule string</span>
                <input className="amf-input" value={rrule} onChange={(e) => setRrule(e.target.value)} placeholder="FREQ=WEEKLY;BYDAY=MO,WE;COUNT=10" />
              </label>
            )}
          </div>

          {/* Custom fields builder */}
          <div className="amf-field">
            <CustomFieldsBuilder fields={customFields} onChange={setCustomFields} />
          </div>

          {/* Actions */}
          <div className="event-form-panel__actions">
            <Button type="button" variant="secondary" size="lg" onClick={onCancel} disabled={saving}>Cancel</Button>
            <Button type="submit" size="lg" loading={saving}>
              {initial?.id ? 'Save changes' : 'Create event'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EventForm;
