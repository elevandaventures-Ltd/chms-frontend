'use client';

/**
 * ResourceManager — Day 29
 *
 * List all resources with type icons, add/edit resource forms,
 * and a per-resource weekly booking calendar.
 * Booked slots = red, available slots = green.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Plus, Edit2, Trash2, Calendar, X } from 'lucide-react';
import {
  addDays, startOfWeek, format, isSameDay,
  isWithinInterval, areIntervalsOverlapping,
} from 'date-fns';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { mockResources, mockBookings, type Resource, type ResourceBooking, type ResourceType } from '@/lib/events';

const TYPE_ICONS: Record<ResourceType, string> = {
  room: '🏛', av: '📺', instrument: '🎹', vehicle: '🚌', other: '📦',
};

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7am–8pm
const WEEK_DAYS = Array.from({ length: 7 }, (_, i) => i);

type BookingFormState = {
  resourceId: string;
  title:      string;
  date:       string;
  startTime:  string;
  endTime:    string;
};

export function ResourceManager() {
  const [resources, setResources]   = useState<Resource[]>([]);
  const [bookings,  setBookings]    = useState<ResourceBooking[]>([]);
  const [selected,  setSelected]    = useState<Resource | null>(null);
  const [weekStart, setWeekStart]   = useState(() => startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [formOpen,  setFormOpen]    = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [editRes,   setEditRes]     = useState<Resource | null>(null);
  const [error,     setError]       = useState('');
  const [saving,    setSaving]      = useState(false);
  const [bookForm,  setBookForm]    = useState<BookingFormState>({ resourceId: '', title: '', date: '', startTime: '09:00', endTime: '10:00' });
  const [resForm,   setResForm]     = useState({ name: '', type: 'room' as ResourceType, capacity: '', description: '' });

  const load = useCallback(async () => {
    try {
      const [rRes, bRes] = await Promise.all([fetch('/api/resources'), fetch('/api/resources/bookings')]);
      const [rJson, bJson] = await Promise.all([rRes.json(), bRes.json()]) as [{ data?: Resource[] }, { data?: ResourceBooking[] }];
      setResources(rJson.data ?? mockResources);
      setBookings((bJson.data ?? mockBookings).map((b) => ({ ...b, start: new Date(b.start), end: new Date(b.end) })));
    } catch {
      setResources(mockResources);
      setBookings(mockBookings.map((b) => ({ ...b, start: new Date(b.start), end: new Date(b.end) })));
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  function bookingsForResourceDay(res: Resource, day: Date): ResourceBooking[] {
    return bookings.filter((b) => b.resourceId === res.id && isSameDay(b.start, day));
  }

  function isSlotBooked(res: Resource, day: Date, hour: number): ResourceBooking | undefined {
    const slotStart = new Date(day); slotStart.setHours(hour, 0, 0, 0);
    const slotEnd   = new Date(day); slotEnd.setHours(hour + 1, 0, 0, 0);
    return bookings.find((b) =>
      b.resourceId === res.id &&
      areIntervalsOverlapping({ start: b.start, end: b.end }, { start: slotStart, end: slotEnd }),
    );
  }

  async function saveResource() {
    if (!resForm.name.trim()) { setError('Name is required.'); return; }
    setSaving(true); setError('');
    const body = { name: resForm.name.trim(), type: resForm.type, capacity: resForm.capacity ? parseInt(resForm.capacity, 10) : undefined, description: resForm.description.trim() || undefined };
    try {
      const method = editRes ? 'PUT' : 'POST';
      const url    = editRes ? `/api/resources/${editRes.id}` : '/api/resources';
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const json   = await res.json() as { data?: Resource };
      const saved  = json.data ?? { ...body, id: `r${Date.now()}`, capacity: body.capacity ?? undefined };
      if (editRes) setResources((prev) => prev.map((r) => r.id === editRes.id ? saved : r));
      else setResources((prev) => [...prev, saved]);
      setFormOpen(false); setEditRes(null);
    } catch { setError('Failed to save resource.'); }
    finally { setSaving(false); }
  }

  async function saveBooking() {
    if (!bookForm.title.trim() || !bookForm.date) { setError('Title and date are required.'); return; }
    setSaving(true); setError('');
    const start = new Date(`${bookForm.date}T${bookForm.startTime}`);
    const end   = new Date(`${bookForm.date}T${bookForm.endTime}`);
    if (end <= start) { setError('End time must be after start time.'); setSaving(false); return; }

    // Check double-booking client-side
    const conflict = bookings.find((b) =>
      b.resourceId === bookForm.resourceId &&
      areIntervalsOverlapping({ start: b.start, end: b.end }, { start, end }),
    );
    if (conflict) { setError(`Conflict with: "${conflict.title}"`); setSaving(false); return; }

    try {
      const res  = await fetch('/api/resources/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...bookForm, start: start.toISOString(), end: end.toISOString() }) });
      const json = await res.json() as { data?: ResourceBooking };
      const saved: ResourceBooking = json.data ?? { id: `b${Date.now()}`, resourceId: bookForm.resourceId, title: bookForm.title, start, end, bookedBy: 'You' };
      setBookings((prev) => [...prev, { ...saved, start: new Date(saved.start), end: new Date(saved.end) }]);
      setBookingOpen(false);
    } catch { setError('Failed to save booking.'); }
    finally { setSaving(false); }
  }

  return (
    <div className="resource-mgr">
      {error && <Alert variant="destructive" onClose={() => setError('')}>{error}</Alert>}

      {/* Resource list */}
      <div className="resource-mgr__list-panel">
        <div className="resource-mgr__list-head">
          <h3>Resources</h3>
          <button type="button" className="att-start-btn" onClick={() => { setEditRes(null); setResForm({ name:'', type:'room', capacity:'', description:'' }); setFormOpen(true); }}>
            <Plus size={14} aria-hidden="true" /> Add
          </button>
        </div>

        <div className="resource-list">
          {resources.map((r) => (
            <button key={r.id} type="button"
              className={`resource-item${selected?.id === r.id ? ' resource-item--active' : ''}`}
              onClick={() => setSelected(r)}>
              <span className="resource-item__icon" aria-hidden="true">{TYPE_ICONS[r.type]}</span>
              <span className="resource-item__info">
                <strong>{r.name}</strong>
                <span>{r.type}{r.capacity ? ` · ${r.capacity} cap.` : ''}</span>
              </span>
              <button type="button" className="resource-item__edit" onClick={(e) => { e.stopPropagation(); setEditRes(r); setResForm({ name: r.name, type: r.type, capacity: String(r.capacity ?? ''), description: r.description ?? '' }); setFormOpen(true); }}
                aria-label={`Edit ${r.name}`}><Edit2 size={13} /></button>
            </button>
          ))}
        </div>
      </div>

      {/* Booking calendar */}
      {selected && (
        <div className="resource-mgr__cal-panel">
          <div className="resource-cal__head">
            <button type="button" className="resource-cal__nav" onClick={() => setWeekStart((d) => addDays(d, -7))} aria-label="Previous week">‹</button>
            <h3>{selected.name} — Week of {format(weekStart, 'd MMM yyyy')}</h3>
            <button type="button" className="resource-cal__nav" onClick={() => setWeekStart((d) => addDays(d, 7))} aria-label="Next week">›</button>
            <button type="button" className="att-start-btn" onClick={() => { setBookForm({ resourceId: selected.id, title: '', date: format(new Date(), 'yyyy-MM-dd'), startTime: '09:00', endTime: '10:00' }); setBookingOpen(true); }}>
              <Plus size={14} /> Book
            </button>
          </div>

          <div className="resource-cal__grid">
            {/* Day headers */}
            <div className="resource-cal__time-col" />
            {WEEK_DAYS.map((d) => {
              const day = addDays(weekStart, d);
              return <div key={d} className="resource-cal__day-head">{format(day, 'EEE d')}</div>;
            })}

            {/* Hour rows */}
            {HOURS.map((hour) => (
              <>
                <div key={`h${hour}`} className="resource-cal__time">{hour}:00</div>
                {WEEK_DAYS.map((d) => {
                  const day    = addDays(weekStart, d);
                  const booked = isSlotBooked(selected, day, hour);
                  return (
                    <div
                      key={`${d}-${hour}`}
                      className={`resource-cal__slot${booked ? ' resource-cal__slot--booked' : ' resource-cal__slot--free'}`}
                      title={booked ? booked.title : 'Available'}
                      onClick={() => {
                        if (!booked) {
                          setBookForm({ resourceId: selected.id, title: '', date: format(day, 'yyyy-MM-dd'), startTime: `${String(hour).padStart(2,'0')}:00`, endTime: `${String(hour+1).padStart(2,'0')}:00` });
                          setBookingOpen(true);
                        }
                      }}
                    >
                      {booked ? <span className="resource-cal__booking-title">{booked.title}</span> : null}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </div>
      )}

      {/* Resource form modal */}
      {formOpen && (
        <div className="ui-overlay" onClick={(e) => { if (e.target === e.currentTarget) setFormOpen(false); }}>
          <div className="event-form-panel event-form-panel--sm" role="dialog" aria-label="Resource">
            <div className="event-form-panel__head">
              <h2>{editRes ? 'Edit resource' : 'Add resource'}</h2>
              <button type="button" className="msm-close" onClick={() => setFormOpen(false)}><X size={16} /></button>
            </div>
            <div className="event-form">
              <label className="amf-field"><span className="amf-label">Name *</span><input className="amf-input" value={resForm.name} onChange={(e) => setResForm((p) => ({ ...p, name: e.target.value }))} /></label>
              <label className="amf-field"><span className="amf-label">Type</span>
                <select className="amf-input" value={resForm.type} onChange={(e) => setResForm((p) => ({ ...p, type: e.target.value as ResourceType }))}>
                  {(['room','av','instrument','vehicle','other'] as const).map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
              <label className="amf-field"><span className="amf-label">Capacity</span><input type="number" className="amf-input" value={resForm.capacity} onChange={(e) => setResForm((p) => ({ ...p, capacity: e.target.value }))} /></label>
              <label className="amf-field"><span className="amf-label">Description</span><input className="amf-input" value={resForm.description} onChange={(e) => setResForm((p) => ({ ...p, description: e.target.value }))} /></label>
            </div>
            <div className="event-form-panel__actions">
              <Button variant="secondary" size="md" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button size="md" loading={saving} onClick={() => void saveResource()}>Save</Button>
            </div>
          </div>
        </div>
      )}

      {/* Booking form modal */}
      {bookingOpen && (
        <div className="ui-overlay" onClick={(e) => { if (e.target === e.currentTarget) setBookingOpen(false); }}>
          <div className="event-form-panel event-form-panel--sm" role="dialog" aria-label="Book resource">
            <div className="event-form-panel__head">
              <h2>Book resource</h2>
              <button type="button" className="msm-close" onClick={() => setBookingOpen(false)}><X size={16} /></button>
            </div>
            <div className="event-form">
              <label className="amf-field"><span className="amf-label">Purpose *</span><input className="amf-input" value={bookForm.title} onChange={(e) => setBookForm((p) => ({ ...p, title: e.target.value }))} /></label>
              <label className="amf-field"><span className="amf-label">Date</span><input type="date" className="amf-input" value={bookForm.date} onChange={(e) => setBookForm((p) => ({ ...p, date: e.target.value }))} /></label>
              <div className="amf-row">
                <label className="amf-field"><span className="amf-label">Start</span><input type="time" className="amf-input" value={bookForm.startTime} onChange={(e) => setBookForm((p) => ({ ...p, startTime: e.target.value }))} /></label>
                <label className="amf-field"><span className="amf-label">End</span><input type="time" className="amf-input" value={bookForm.endTime} onChange={(e) => setBookForm((p) => ({ ...p, endTime: e.target.value }))} /></label>
              </div>
            </div>
            <div className="event-form-panel__actions">
              <Button variant="secondary" size="md" onClick={() => setBookingOpen(false)}>Cancel</Button>
              <Button size="md" loading={saving} onClick={() => void saveBooking()}>Book</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResourceManager;
