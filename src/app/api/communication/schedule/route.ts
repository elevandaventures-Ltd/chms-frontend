/**
 * GET  /api/communication/schedule — every scheduled message, newest first
 *      (Day 34: Scheduled Messages list).
 * POST /api/communication/schedule — schedule a message for later delivery.
 *      Body: { channel, subject?, body, filters, reach, sendAtUtc, timezone }
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createScheduledMessage, listScheduledMessages } from '@/lib/communication-store';
import type { AudienceFilters } from '@/components/communication/AudienceSelector';
import type { Channel } from '@/components/communication/MessageComposer';

export async function GET() {
  const data = [...listScheduledMessages()].sort(
    (a, b) => new Date(a.sendAtUtc).getTime() - new Date(b.sendAtUtc).getTime(),
  );
  return NextResponse.json({ data });
}

type Body = {
  channel: Channel;
  subject?: string;
  body: string;
  filters: AudienceFilters;
  reach: number;
  sendAtUtc: string;
  timezone: string;
};

export async function POST(request: NextRequest) {
  let payload: Partial<Body>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (!payload.channel || !payload.body?.trim() || !payload.sendAtUtc || !payload.timezone) {
    return NextResponse.json({ error: 'validation_error', message: 'channel, body, sendAtUtc, and timezone are required.' }, { status: 400 });
  }

  const sendAt = new Date(payload.sendAtUtc);
  if (Number.isNaN(sendAt.getTime()) || sendAt.getTime() <= Date.now()) {
    return NextResponse.json({ error: 'validation_error', message: 'Scheduled time must be in the future.' }, { status: 400 });
  }

  const data = createScheduledMessage({
    channel: payload.channel,
    subject: payload.subject,
    body: payload.body,
    filters: payload.filters ?? { statuses: [], ministries: [], ageGroups: [], zones: [] },
    reach: payload.reach ?? 0,
    sendAtUtc: payload.sendAtUtc,
    timezone: payload.timezone,
  });

  return NextResponse.json({ data }, { status: 201 });
}
