/**
 * communication.ts — shared types + mock fixtures for Days 34–37:
 * message scheduling, WhatsApp bulk composer, and the WhatsApp inbox.
 */
import type { AudienceFilters } from '@/components/communication/AudienceSelector';
import type { Channel } from '@/components/communication/MessageComposer';

// ── Timezones (Day 34) ────────────────────────────────────────────────────────

/** Offset (ms) of `timeZone` from UTC at the instant `date` represents. */
function getTimezoneOffsetMs(date: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone, hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  const parts = dtf.formatToParts(date).reduce<Record<string, string>>((acc, p) => {
    acc[p.type] = p.value;
    return acc;
  }, {});
  const asUtc = Date.UTC(
    Number(parts.year), Number(parts.month) - 1, Number(parts.day),
    Number(parts.hour), Number(parts.minute), Number(parts.second),
  );
  return asUtc - date.getTime();
}

/** Convert a "YYYY-MM-DD" + "HH:mm" wall-clock pair in `timeZone` to a UTC ISO string. */
export function zonedWallTimeToUtcIso(dateStr: string, timeStr: string, timeZone: string): string {
  const guessUtcMs = Date.parse(`${dateStr}T${timeStr}:00Z`);
  const offset = getTimezoneOffsetMs(new Date(guessUtcMs), timeZone);
  return new Date(guessUtcMs - offset).toISOString();
}

export const AFRICA_TIMEZONES: { value: string; label: string }[] = [
  { value: 'Africa/Nairobi',     label: 'Nairobi (EAT, UTC+3)' },
  { value: 'Africa/Lagos',       label: 'Lagos (WAT, UTC+1)' },
  { value: 'Africa/Johannesburg',label: 'Johannesburg (SAST, UTC+2)' },
  { value: 'Africa/Accra',       label: 'Accra (GMT, UTC+0)' },
  { value: 'Africa/Cairo',       label: 'Cairo (EET, UTC+2)' },
  { value: 'Africa/Kigali',      label: 'Kigali (CAT, UTC+2)' },
  { value: 'Africa/Casablanca',  label: 'Casablanca (WEST, UTC+1)' },
  { value: 'UTC',                label: 'UTC' },
];

// ── Scheduled messages (Day 34) ───────────────────────────────────────────────

export type ScheduledStatus = 'scheduled' | 'sent' | 'canceled' | 'failed';

export type ScheduledMessage = {
  id: string;
  channel: Channel;
  subject?: string;
  body: string;
  filters: AudienceFilters;
  reach: number;
  sendAtUtc: string; // ISO, always UTC
  timezone: string;  // IANA zone the admin picked it in
  status: ScheduledStatus;
  createdAt: string;
  sentAt?: string;
};

// ── WhatsApp approved-template catalog (Day 36) ───────────────────────────────
// WhatsApp Business API only allows pre-approved templates for outbound bulk
// (non-session) messages — session replies in the inbox can be freeform.

export type WhatsAppTemplateStatus = 'approved' | 'pending' | 'rejected';

export type WhatsAppTemplate = {
  id: string;
  name: string;
  category: 'Utility' | 'Marketing' | 'Authentication';
  body: string;        // {{1}}, {{2}}… positional variables, WhatsApp-style
  variables: string[]; // human labels, in order
  status: WhatsAppTemplateStatus;
};

export const WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'wt1', name: 'service_reminder', category: 'Utility', status: 'approved',
    body: 'Hi {{1}}, reminder that {{2}} starts at {{3}} today. See you there! 🙏',
    variables: ['First name', 'Service name', 'Start time'],
  },
  {
    id: 'wt2', name: 'event_invite', category: 'Marketing', status: 'approved',
    body: '🎉 {{1}}, you\'re invited to *{{2}}* on {{3}}. Location: {{4}}.',
    variables: ['First name', 'Event title', 'Date', 'Location'],
  },
  {
    id: 'wt3', name: 'giving_receipt', category: 'Utility', status: 'approved',
    body: 'Thank you {{1}} for your gift of {{2}} on {{3}}. God bless you! 🙌',
    variables: ['First name', 'Amount', 'Date'],
  },
  {
    id: 'wt4', name: 'new_sermon_series', category: 'Marketing', status: 'pending',
    body: 'A new sermon series "{{1}}" begins this Sunday. Don\'t miss it, {{2}}!',
    variables: ['Series name', 'First name'],
  },
  {
    id: 'wt5', name: 'holiday_greeting_promo', category: 'Marketing', status: 'rejected',
    body: 'Happy holidays {{1}}! Check out our special holiday merchandise at {{2}}.',
    variables: ['First name', 'Link'],
  },
];

/** Resolve {{1}}, {{2}}… placeholders against an ordered list of values. */
export function resolveWhatsAppTemplate(body: string, values: string[]): string {
  return body.replace(/\{\{(\d+)\}\}/g, (_match, idx: string) => {
    const i = parseInt(idx, 10) - 1;
    return values[i]?.trim() || `{{${idx}}}`;
  });
}

// ── WhatsApp inbox (Day 37) ───────────────────────────────────────────────────

export type WhatsAppMessage = {
  id: string;
  sender: 'admin' | 'member';
  text: string;
  sentAt: string;
  status: 'sent' | 'delivered' | 'read';
};

export type WhatsAppConversation = {
  id: string;
  memberName: string;
  memberPhone: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
};

export const mockConversations: WhatsAppConversation[] = [
  { id: 'w1', memberName: 'Abena Mensah',   memberPhone: '+233 24 111 2233', lastMessage: 'Thank you, see you Sunday!',             lastMessageAt: minutesAgo(8),    unreadCount: 0 },
  { id: 'w2', memberName: 'Kwame Asante',   memberPhone: '+233 20 234 5678', lastMessage: 'Can I bring a friend to youth night?',    lastMessageAt: minutesAgo(22),   unreadCount: 2 },
  { id: 'w3', memberName: 'Ama Boateng',    memberPhone: '+233 26 345 6789', lastMessage: 'Is the outreach still on for Saturday?',  lastMessageAt: minutesAgo(55),   unreadCount: 1 },
  { id: 'w4', memberName: 'Kofi Owusu',     memberPhone: '+233 55 456 7890', lastMessage: 'Got it, thanks pastor 🙏',                lastMessageAt: minutesAgo(180),  unreadCount: 0 },
  { id: 'w5', memberName: 'Efua Darko',     memberPhone: '+233 24 567 8901', lastMessage: 'Would love a receipt for last week\'s gift.', lastMessageAt: minutesAgo(420), unreadCount: 0 },
];

export const mockMessagesByConversation: Record<string, WhatsAppMessage[]> = {
  w1: [
    { id: 'm1', sender: 'admin',  text: 'Hi Abena! Reminder that Sunday First Service starts at 8am tomorrow.', sentAt: minutesAgo(40), status: 'read' },
    { id: 'm2', sender: 'member', text: 'Thank you, see you Sunday!', sentAt: minutesAgo(8), status: 'read' },
  ],
  w2: [
    { id: 'm3', sender: 'admin',  text: '🎉 Youth Fellowship is this Friday at 6pm in the Youth Hall!', sentAt: minutesAgo(60), status: 'read' },
    { id: 'm4', sender: 'member', text: 'Can I bring a friend to youth night?', sentAt: minutesAgo(22), status: 'delivered' },
    { id: 'm5', sender: 'member', text: 'She\'s new to the area and would love to come', sentAt: minutesAgo(21), status: 'delivered' },
  ],
  w3: [
    { id: 'm6', sender: 'admin',  text: 'Community Outreach is happening this Saturday at Korle Bu — join us!', sentAt: minutesAgo(90), status: 'read' },
    { id: 'm7', sender: 'member', text: 'Is the outreach still on for Saturday?', sentAt: minutesAgo(55), status: 'delivered' },
  ],
  w4: [
    { id: 'm8', sender: 'admin',  text: 'Hi Kofi, your pledge reminder: outstanding balance of GHS 200.', sentAt: minutesAgo(200), status: 'read' },
    { id: 'm9', sender: 'member', text: 'Got it, thanks pastor 🙏', sentAt: minutesAgo(180), status: 'read' },
  ],
  w5: [
    { id: 'm10', sender: 'member', text: 'Would love a receipt for last week\'s gift.', sentAt: minutesAgo(420), status: 'delivered' },
  ],
};

function minutesAgo(m: number): string {
  return new Date(Date.now() - m * 60_000).toISOString();
}

// ── Sent message reports (Day 32, extended Day 35 with a failed count) ──────

export type MessageReport = {
  id:         string;
  channel:    'sms' | 'email' | 'whatsapp' | 'push';
  subject?:   string;
  recipients: number;
  delivered:  number;
  failed:     number;
  opened?:    number;   // email only
  sentAt:     string;   // ISO
  status:     'sent' | 'sending' | 'failed' | 'partial';
};

export const mockMessageReports: MessageReport[] = [
  { id: 'r1', channel: 'email',    subject: 'Sunday Service Reminder',  recipients: 18, delivered: 17, failed: 1, opened: 11, sentAt: new Date(Date.now() - 3_600_000).toISOString(),  status: 'sent' },
  { id: 'r2', channel: 'sms',      subject: undefined,                  recipients: 14, delivered: 14, failed: 0, sentAt: new Date(Date.now() - 7_200_000).toISOString(),  status: 'sent' },
  { id: 'r3', channel: 'whatsapp', subject: undefined,                  recipients: 8,  delivered: 7,  failed: 1, sentAt: new Date(Date.now() - 86_400_000).toISOString(), status: 'partial' },
  { id: 'r4', channel: 'push',     subject: 'Youth Night Tonight',      recipients: 20, delivered: 19, failed: 1, sentAt: new Date(Date.now() - 172_800_000).toISOString(),status: 'sent' },
  { id: 'r5', channel: 'email',    subject: 'Monthly Newsletter',       recipients: 20, delivered: 20, failed: 0, opened: 14, sentAt: new Date(Date.now() - 259_200_000).toISOString(),status: 'sent' },
];
