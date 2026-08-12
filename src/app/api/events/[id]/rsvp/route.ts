/**
 * POST /api/events/:id/rsvp — RSVP to an event (Day 28).
 * Returns { status: 'going' | 'waitlisted', position? }
 */
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  // Mock: 1-in-4 chance of waitlist for demo purposes
  const waitlisted = Math.random() < 0.25;
  return NextResponse.json(
    waitlisted
      ? { status: 'waitlisted', position: Math.floor(Math.random() * 5) + 1, eventId: id }
      : { status: 'going', eventId: id },
    { status: 201 },
  );
}
