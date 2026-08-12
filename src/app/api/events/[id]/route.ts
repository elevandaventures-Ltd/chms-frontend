/**
 * GET /api/events/:id  — fetch a single event
 * PUT /api/events/:id  — update event (including customFields)
 * Falls back to mock data when Supabase is absent.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { mockEvents, type ChmsEvent } from '@/lib/events';
import { addAuditEntry } from '@/lib/church-store';

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

    const changes = (Object.keys(body) as (keyof ChmsEvent)[])
      .filter((key) => key !== 'id' && JSON.stringify((base as Partial<ChmsEvent>)[key]) !== JSON.stringify(body[key]))
      .map((key) => ({ field: key, before: (base as Partial<ChmsEvent>)[key] ?? null, after: body[key] ?? null }));

    if (changes.length > 0) {
      addAuditEntry({
        actorName: 'Solomon Leek', action: 'event.updated', resourceType: 'Event',
        resourceId: id, resourceLabel: updated.title ?? id, changes,
      });
    }

    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json({ error: 'Failed to update event.' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const event = mockEvents.find((e) => e.id === id);
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

  // In production: delete the Supabase row. Mock mode has nothing to
  // persist deletion against, so this only records the audit trail.
  addAuditEntry({
    actorName: 'Solomon Leek', action: 'event.deleted', resourceType: 'Event',
    resourceId: id, resourceLabel: event.title,
    changes: [{ field: 'title', before: event.title, after: null }],
  });

  return NextResponse.json({ data: { id } });
}
