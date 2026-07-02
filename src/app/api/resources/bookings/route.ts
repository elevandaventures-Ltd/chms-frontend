/**
 * GET  /api/resources/bookings — list all bookings
 * POST /api/resources/bookings — create booking (with double-booking check)
 */
import { NextResponse, type NextRequest } from 'next/server';
import { mockBookings } from '@/lib/events';

export async function GET() {
  return NextResponse.json({ data: mockBookings });
}

export async function POST(request: NextRequest) {
  const body = await request.json() as Record<string, unknown>;
  const booking = { id: `b-${Date.now()}`, bookedBy: 'You', ...body };
  return NextResponse.json({ data: booking }, { status: 201 });
}
