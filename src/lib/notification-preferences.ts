/**
 * notification-preferences.ts — member-facing notification matrix
 * (Day 38 Task 2): which notification types a member receives, per
 * channel. Distinct from the public token-based /unsubscribe page
 * (Day 40) — this is the logged-in member's own settings page.
 */
import type { Channel } from '@/components/communication/MessageComposer';

export type NotificationCategory = 'eventReminders' | 'newMessages' | 'prayerRequests' | 'givingReceipts';

export const NOTIFICATION_CATEGORY_LABEL: Record<NotificationCategory, string> = {
  eventReminders: 'Event Reminders',
  newMessages: 'New Messages',
  prayerRequests: 'Prayer Requests',
  givingReceipts: 'Giving Receipts',
};

export const NOTIFICATION_CHANNELS: Channel[] = ['sms', 'email', 'whatsapp', 'push'];

export const CHANNEL_LABEL: Record<Channel, string> = {
  sms: 'SMS', email: 'Email', whatsapp: 'WhatsApp', push: 'Push',
};

export type NotificationPrefsMatrix = Record<NotificationCategory, Record<Channel, boolean>>;

export function defaultPrefsMatrix(): NotificationPrefsMatrix {
  return {
    eventReminders:  { sms: true,  email: true,  whatsapp: true,  push: true },
    newMessages:     { sms: false, email: true,  whatsapp: true,  push: true },
    prayerRequests:  { sms: false, email: true,  whatsapp: false, push: true },
    givingReceipts:  { sms: false, email: true,  whatsapp: false, push: false },
  };
}
