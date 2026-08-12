/**
 * POST /api/communication/schedule/process — fire every scheduled message
 * whose send time has passed (Day 34 review: "verify it arrives at the
 * scheduled time").
 *
 * There is no server-side cron in this project, so the Scheduled Messages
 * list polls this endpoint every few seconds while it's open — the same
 * "tick" a real cron/queue worker would perform, just client-triggered.
 */
import { NextResponse } from 'next/server';
import { processDueScheduledMessages } from '@/lib/communication-store';
import { addMessageReport } from '@/lib/communication-store';

export async function POST() {
  const due = processDueScheduledMessages();

  due.forEach((msg) => {
    const failed = msg.reach > 0 ? Math.round(msg.reach * 0.03) : 0;
    addMessageReport({
      channel: msg.channel,
      subject: msg.subject,
      recipients: msg.reach,
      delivered: msg.reach - failed,
      failed,
      opened: msg.channel === 'email' ? 0 : undefined,
      sentAt: msg.sentAt ?? new Date().toISOString(),
      status: failed > 0 ? 'partial' : 'sent',
    });
  });

  return NextResponse.json({ data: due });
}
