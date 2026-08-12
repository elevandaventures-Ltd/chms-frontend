/**
 * GET  /api/events — list events
 * POST /api/events — create event
 * Falls back to mock data when Supabase is absent.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { mockEvents } from '@/lib/events';

export async function GET() {
  return NextResponse.json({ data: mockEvents });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const event = {
      id:        `ev-${Date.now()}`,
      rsvpCount: 0,
      ...body,
      start: new Date(body.start as string),
      end:   new Date(body.end   as string),
    };
    return NextResponse.json({ data: event }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create event.' }, { status: 500 });
  }
}
