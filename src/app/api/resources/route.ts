/**
 * GET  /api/resources — list resources (Day 29)
 * POST /api/resources — create resource
 */
import { NextResponse, type NextRequest } from 'next/server';
import { mockResources } from '@/lib/events';

export async function GET() {
  return NextResponse.json({ data: mockResources });
}

export async function POST(request: NextRequest) {
  const body = await request.json() as Record<string, unknown>;
  return NextResponse.json({ data: { id: `r-${Date.now()}`, ...body } }, { status: 201 });
}
