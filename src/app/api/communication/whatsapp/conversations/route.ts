/**
 * GET /api/communication/whatsapp/conversations — inbox conversation list
 * (Day 37): member name, last message preview, unread count.
 */
import { NextResponse } from 'next/server';
import { listConversations } from '@/lib/communication-store';

export async function GET() {
  return NextResponse.json({ data: listConversations() });
}
