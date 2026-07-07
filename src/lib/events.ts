/**
 * Events domain types, labels, colours and mock data (Days 26–29).
 */
import { addDays, addWeeks, addMonths } from 'date-fns';

// ── Event types & colours ─────────────────────────────────────────────────────

export type EventType =
  | 'worship' | 'outreach' | 'training' | 'wedding' | 'youth' | 'funeral' | 'other';

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  worship:  'Worship',
  outreach: 'Outreach',
  training: 'Training',
  wedding:  'Wedding',
  youth:    'Youth',
  funeral:  'Funeral',
  other:    'Other',
};

/** Matches the Day 26 spec: forest green, blue, gold, pink, purple, grey */
export const EVENT_TYPE_COLOURS: Record<EventType, string> = {
  worship:  '#274c3f',  // forest green
  outreach: '#2563eb',  // blue
  training: '#d97706',  // gold
  wedding:  '#ec4899',  // pink
  youth:    '#7c3aed',  // purple
  funeral:  '#6b7280',  // grey
  other:    '#b25131',  // accent
};

export const EVENT_TYPES: EventType[] = [
  'worship', 'outreach', 'training', 'wedding', 'youth', 'funeral', 'other',
];

// ── Recurrence ────────────────────────────────────────────────────────────────

export type RecurrencePattern =
  | { type: 'none' }
  | { type: 'daily' }
  | { type: 'weekly'; days: number[] }       // 0=Sun … 6=Sat
  | { type: 'monthly'; dayOfMonth: number }
  | { type: 'custom'; rrule: string };

// ── ChMS Event ────────────────────────────────────────────────────────────────

export type ChmsEvent = {
  id: string;
  title: string;
  description?: string;
  type: EventType;
  start: Date;
  end: Date;
  location?: string;
  capacity?: number;
  rsvpCount: number;
  recurrence: RecurrencePattern;
  isRecurringInstance?: boolean;
  parentId?: string;
  customFields?: CustomField[];
  attendees?: Attendee[];
};

// ── Custom registration fields ───────────────────────────────────────────────

export type CustomFieldType = 'text' | 'dropdown' | 'checkbox';

export type CustomField = {
  id:       string;
  type:     CustomFieldType;
  label:    string;
  required: boolean;
  options?: string[];   // dropdown choices
  placeholder?: string; // text hint
};

// ── Attendee ─────────────────────────────────────────────────────────────────

export type Attendee = {
  id:       string;
  name:     string;
  email:    string;
  status:   'going' | 'waitlisted' | 'cancelled';
  rsvpedAt: string; // ISO
};

// ── RSVP ─────────────────────────────────────────────────────────────────────

export type RsvpStatus = 'going' | 'waitlisted' | 'cancelled';

export type Rsvp = {
  eventId:  string;
  memberId: string;
  status:   RsvpStatus;
  position?: number; // waitlist position
};

// ── Resource ─────────────────────────────────────────────────────────────────

export type ResourceType = 'room' | 'av' | 'instrument' | 'vehicle' | 'other';

export type Resource = {
  id:          string;
  name:        string;
  type:        ResourceType;
  description?: string;
  capacity?:   number;
};

export type ResourceBooking = {
  id:         string;
  resourceId: string;
  eventId?:   string;
  title:      string;
  start:      Date;
  end:        Date;
  bookedBy:   string;
};

// ── Mock data ─────────────────────────────────────────────────────────────────

const now = new Date();

export const mockEvents: ChmsEvent[] = [
  {
    id: 'ev1', title: 'Sunday First Service', type: 'worship',
    start: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 8, 0),
    end:   new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 0),
    location: 'Main Sanctuary', capacity: 400, rsvpCount: 312,
    recurrence: { type: 'weekly', days: [0] },
    description: 'Weekly Sunday worship service.',
    customFields: [
      { id: 'cf1', type: 'text',     label: 'Dietary requirements', required: false, placeholder: 'e.g. vegetarian, gluten-free' },
      { id: 'cf2', type: 'dropdown', label: 'Service preference',   required: true,  options: ['First Service (8am)', 'Second Service (10am)', 'Third Service (12pm)'] },
      { id: 'cf3', type: 'checkbox', label: 'I will bring a guest', required: false },
    ],
    attendees: [
      { id: 'a1', name: 'Abena Mensah',   email: 'abena@elevanda.org',   status: 'going',       rsvpedAt: '2026-06-10T09:00:00Z' },
      { id: 'a2', name: 'Kwame Asante',   email: 'kwame@elevanda.org',   status: 'going',       rsvpedAt: '2026-06-10T09:15:00Z' },
      { id: 'a3', name: 'Ama Boateng',    email: 'ama@elevanda.org',     status: 'going',       rsvpedAt: '2026-06-10T10:00:00Z' },
      { id: 'a4', name: 'Kofi Owusu',     email: 'kofi@elevanda.org',    status: 'waitlisted',  rsvpedAt: '2026-06-11T08:00:00Z' },
      { id: 'a5', name: 'Efua Darko',     email: 'efua@elevanda.org',    status: 'going',       rsvpedAt: '2026-06-11T08:30:00Z' },
      { id: 'a6', name: 'Yaw Appiah',     email: 'yaw@elevanda.org',     status: 'cancelled',   rsvpedAt: '2026-06-09T14:00:00Z' },
    ],
  },
  {
    id: 'ev2', title: 'Youth Fellowship', type: 'youth',
    start: addDays(now, 3),
    end:   addDays(now, 3),
    location: 'Youth Hall', capacity: 80, rsvpCount: 45,
    recurrence: { type: 'weekly', days: [5] },
    description: 'Friday youth gathering.',
  },
  {
    id: 'ev3', title: 'Community Outreach', type: 'outreach',
    start: addDays(now, 7),
    end:   addDays(now, 7),
    location: 'Korle Bu Community', capacity: 50, rsvpCount: 38,
    recurrence: { type: 'none' },
    description: 'Monthly community food distribution.',
  },
  {
    id: 'ev4', title: 'Leadership Training', type: 'training',
    start: addWeeks(now, 1),
    end:   addWeeks(now, 1),
    location: 'Conference Room A', capacity: 30, rsvpCount: 22,
    recurrence: { type: 'monthly', dayOfMonth: 15 },
    description: 'Monthly leadership development session.',
  },
  {
    id: 'ev5', title: 'Wedding — Mensah & Owusu', type: 'wedding',
    start: addDays(now, 14),
    end:   addDays(now, 14),
    location: 'Main Sanctuary', capacity: 200, rsvpCount: 167,
    recurrence: { type: 'none' },
  },
  {
    id: 'ev6', title: 'Bible Study', type: 'training',
    start: addDays(now, 2),
    end:   addDays(now, 2),
    location: 'Fellowship Hall', capacity: 60, rsvpCount: 41,
    recurrence: { type: 'weekly', days: [3] },
    description: 'Wednesday evening Bible study.',
  },
];

export const mockResources: Resource[] = [
  { id: 'r1', name: 'Main Sanctuary',    type: 'room',       capacity: 400, description: 'Primary worship space' },
  { id: 'r2', name: 'Youth Hall',        type: 'room',       capacity: 100 },
  { id: 'r3', name: 'Conference Room A', type: 'room',       capacity: 30 },
  { id: 'r4', name: 'PA System',         type: 'av',         description: 'Full audio system with 12-channel mixer' },
  { id: 'r5', name: 'Projector + Screen',type: 'av' },
  { id: 'r6', name: 'Grand Piano',       type: 'instrument' },
  { id: 'r7', name: 'Church Van',        type: 'vehicle',    description: '14-seater minibus' },
];

export const mockBookings: ResourceBooking[] = [
  { id: 'b1', resourceId: 'r1', eventId: 'ev1', title: 'Sunday Service',      start: addDays(now, 1),  end: addDays(now, 1),  bookedBy: 'Ekow Hammond' },
  { id: 'b2', resourceId: 'r4', eventId: 'ev1', title: 'Sunday Service PA',   start: addDays(now, 1),  end: addDays(now, 1),  bookedBy: 'Kweku Annan' },
  { id: 'b3', resourceId: 'r2', eventId: 'ev2', title: 'Youth Fellowship',    start: addDays(now, 3),  end: addDays(now, 3),  bookedBy: 'Kwame Asante' },
  { id: 'b4', resourceId: 'r3', eventId: 'ev4', title: 'Leadership Training', start: addWeeks(now, 1), end: addWeeks(now, 1), bookedBy: 'Abena Mensah' },
];
