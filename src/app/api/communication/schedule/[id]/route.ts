/**
 * DELETE /api/communication/schedule/:id — cancel a scheduled message
 * before it sends (Day 34 review: "cancel a scheduled message before it
 * sends").
 */
import { NextResponse, type NextRequest } from 'next/server';
import { cancelScheduledMessage } from '@/lib/communication-store';

type RouteCtx = { params: Promise<{ id: string }> };

export async function DELETE(_request: NextRequest, ctx: RouteCtx) {
  const { id } = await ctx.params;
  const canceled = cancelScheduledMessage(id);
  if (!canceled) return NextResponse.json({ error: 'not_found_or_already_sent' }, { status: 404 });
  return NextResponse.json({ data: canceled });
}
