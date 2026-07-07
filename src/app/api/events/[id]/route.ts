/**
 * GET /api/events/:id  — fetch a single event
 * PUT /api/events/:id  — update event (including customFields)
 * Falls back to mock data when Supabase is absent.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { mockEvents, type ChmsEvent } from '@/lib/events';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const event = mockEvents.find((e) => e.id === id);
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  return NextResponse.json({ data: event });
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    const body = await request.json() as Partial<ChmsEvent>;
    // In production: update Supabase row. Here we echo back the merged event.
    const base  = mockEvents.find((e) => e.id === id) ?? { id };
    const updated = {
      ...base,
      ...body,
      id,
      start: body.start ? new Date(body.start as unknown as string) : (base as ChmsEvent).start,
      end:   body.end   ? new Date(body.end   as unknown as string) : (base as ChmsEvent).end,
    };
    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json({ error: 'Failed to update event.' }, { status: 500 });
  }
}
