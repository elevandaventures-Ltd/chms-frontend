/**
 * GET  /api/communication/whatsapp/conversations/:id/messages — the full
 *      message thread for one conversation (Day 37), and marks it read.
 * POST .../messages — send a reply from the admin.
 *      Body: { text: string }
 */
import { NextResponse, type NextRequest } from 'next/server';
import { getConversation, getMessages, markConversationRead, sendReply } from '@/lib/communication-store';

type RouteCtx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, ctx: RouteCtx) {
  const { id } = await ctx.params;
  const convo = getConversation(id);
  if (!convo) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  markConversationRead(id);
  return NextResponse.json({ data: getMessages(id) });
}

export async function POST(request: NextRequest, ctx: RouteCtx) {
  const { id } = await ctx.params;
  let body: { text?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  if (!body.text?.trim()) return NextResponse.json({ error: 'validation_error', message: 'Message text is required.' }, { status: 400 });

  const message = sendReply(id, body.text.trim());
  if (!message) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  return NextResponse.json({ data: message }, { status: 201 });
}
