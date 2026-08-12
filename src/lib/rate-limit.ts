/**
 * rate-limit.ts — per-channel gateway rate limiting (Day 35 review:
 * "rate limiting confirmed not exceeding gateway limits").
 *
 * Real SMS/WhatsApp gateways (Twilio, WhatsApp Business API) cap how many
 * messages you can push per second/minute. This is a simple in-memory
 * fixed-window counter — good enough to demonstrate the guard without a
 * Redis-backed limiter, and consistent with this project's other
 * in-memory mock stores.
 */
import type { Channel } from '@/components/communication/MessageComposer';

/** Messages allowed per rolling 60s window, per channel — mirrors typical gateway caps. */
export const GATEWAY_LIMIT_PER_MINUTE: Record<Channel, number> = {
  sms: 60,       // Twilio trial-tier-ish: ~1/sec
  whatsapp: 80,  // WhatsApp Business API messaging-tier-ish
  email: 500,    // Bulk ESP send rate
  push: 1000,    // Web Push fan-out
};

const windowStart = new Map<Channel, number>();
const windowCount = new Map<Channel, number>();

const WINDOW_MS = 60_000;

export type RateLimitResult =
  | { allowed: true; remaining: number; batches: number; estimatedSeconds: number }
  | { allowed: false; retryAfterSeconds: number };

/** Reserve `count` sends against a channel's per-minute gateway limit. */
export function checkRateLimit(channel: Channel, count: number): RateLimitResult {
  const now = Date.now();
  const limit = GATEWAY_LIMIT_PER_MINUTE[channel];

  const start = windowStart.get(channel) ?? 0;
  if (now - start >= WINDOW_MS) {
    windowStart.set(channel, now);
    windowCount.set(channel, 0);
  }

  const used = windowCount.get(channel) ?? 0;

  if (used + count > limit) {
    const elapsed = now - (windowStart.get(channel) ?? now);
    const retryAfterSeconds = Math.max(1, Math.ceil((WINDOW_MS - elapsed) / 1000));
    return { allowed: false, retryAfterSeconds };
  }

  windowCount.set(channel, used + count);

  const perSecond = Math.max(1, Math.round(limit / 60));
  const batches = Math.ceil(count / perSecond);
  return { allowed: true, remaining: limit - (used + count), batches, estimatedSeconds: batches };
}

/** Human estimate shown in the send-confirmation dialog, before actually sending. */
export function estimateDelivery(channel: Channel, count: number): { batches: number; estimatedSeconds: number } {
  const limit = GATEWAY_LIMIT_PER_MINUTE[channel];
  const perSecond = Math.max(1, Math.round(limit / 60));
  const batches = Math.ceil(count / perSecond);
  return { batches, estimatedSeconds: batches };
}
