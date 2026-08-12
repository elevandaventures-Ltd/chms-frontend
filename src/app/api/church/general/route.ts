/**
 * GET/PUT /api/church/general — denomination, timezone, currency,
 * language (Day 47 Task 2). Changing denomination re-seeds the church's
 * default ministry list (Day 50 review).
 */
import { NextResponse, type NextRequest } from 'next/server';
import { getGeneral, updateGeneral } from '@/lib/church-store';
import type { ChurchGeneral } from '@/lib/church-branding';

export async function GET() {
  return NextResponse.json({ data: getGeneral() });
}

export async function PUT(request: NextRequest) {
  let body: Partial<ChurchGeneral>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const { general, seededMinistries } = updateGeneral(body);
  return NextResponse.json({ data: general, seededMinistries });
}
