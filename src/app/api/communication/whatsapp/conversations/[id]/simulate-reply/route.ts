/**
 * POST /api/communication/whatsapp/conversations/:id/simulate-reply
 *
 * Dev aid only: this project has no live WhatsApp Business webhook
 * connected, so there is no real "reply from phone" to receive. This
 * endpoint mimics what an inbound-webhook handler would do — it's the
 * "reply from phone" step for the Day 37 review flow in a sandbox
 * without a connected test number.
 * Body: { text?: string } — defaults to a canned reply when omitted.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { simulateIncomingReply } from '@/lib/communication-store';

const DEFAULT_REPLIES = [
  'Thanks for letting me know!',
  'Sounds good, see you then 🙏',
  'Can you send more details?',
  'Got it, appreciate it!',
];

type RouteCtx = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, ctx: RouteCtx) {
  const { id } = await ctx.params;
  let body: { text?: string } = {};
  try { body = await request.json(); } catch { /* optional body */ }

  const text = body.text?.trim() || DEFAULT_REPLIES[Math.floor(Math.random() * DEFAULT_REPLIES.length)];
  const message = simulateIncomingReply(id, text);
  if (!message) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  return NextResponse.json({ data: message }, { status: 201 });
}
