/**
 * channel-performance.ts — mock data for the Communication → Analytics tab
 * (Day 40): channel delivery-rate comparison, best-time-to-send heatmap,
 * and message-category performance breakdown.
 */

export type ChannelKey = 'sms' | 'email' | 'whatsapp' | 'push';

export const CHANNEL_LABEL: Record<ChannelKey, string> = {
  sms: 'SMS', email: 'Email', whatsapp: 'WhatsApp', push: 'Push',
};

/** Reuses the same channel colors as DeliveryReport's .dr-channel-- badges. */
export const CHANNEL_COLOR: Record<ChannelKey, string> = {
  sms: '#2563eb', email: '#b25131', whatsapp: '#16a34a', push: '#7c3aed',
};

export type ChannelRate = { channel: ChannelKey; sent: number; delivered: number };

export const channelDeliveryRates: ChannelRate[] = [
  { channel: 'sms', sent: 1240, delivered: 1206 },
  { channel: 'email', sent: 980, delivered: 887 },
  { channel: 'whatsapp', sent: 640, delivered: 611 },
  { channel: 'push', sent: 410, delivered: 352 },
];

/** Best-time-to-send heatmap: engagement rate (0–100) by day × hour bucket. */
export const HEATMAP_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
export const HEATMAP_HOURS = ['6a', '9a', '12p', '3p', '6p', '9p'] as const;

// Rows = days, columns = hour buckets. Sunday morning (pre-service) and
// Wednesday evening (midweek service) read as the strongest windows.
export const heatmapEngagement: number[][] = [
  [22, 38, 41, 33, 52, 29], // Mon
  [19, 35, 40, 30, 47, 26], // Tue
  [24, 40, 44, 36, 68, 45], // Wed — midweek service
  [20, 33, 39, 31, 49, 28], // Thu
  [26, 41, 46, 40, 58, 51], // Fri
  [31, 47, 55, 44, 62, 48], // Sat
  [72, 58, 34, 22, 30, 20], // Sun — pre-service morning peak
];

export type CategoryPerformance = { category: string; sent: number; delivered: number };

export const categoryPerformance: CategoryPerformance[] = [
  { category: 'Service Reminders', sent: 920, delivered: 902 },
  { category: 'Event Invitations', sent: 640, delivered: 598 },
  { category: 'Newsletter', sent: 520, delivered: 441 },
  { category: 'Giving & Stewardship', sent: 380, delivered: 349 },
  { category: 'Prayer Requests', sent: 210, delivered: 204 },
  { category: 'General Announcements', sent: 600, delivered: 562 },
];
