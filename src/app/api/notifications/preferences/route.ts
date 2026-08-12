/**
 * GET/PATCH /api/notifications/preferences — the current member's
 * notification-type × channel matrix (Day 38 Task 2).
 *
 * Dev/mock mode (no multi-tenant member session in this sandbox) reads
 * and writes a single demo member's prefs in-memory, same convention as
 * DEMO_CHURCH_ID elsewhere.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { defaultPrefsMatrix, type NotificationPrefsMatrix } from '@/lib/notification-preferences';

let demoPrefs: NotificationPrefsMatrix = defaultPrefsMatrix();

export async function GET() {
  return NextResponse.json({ data: demoPrefs });
}

export async function PATCH(request: NextRequest) {
  let body: Partial<NotificationPrefsMatrix>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  demoPrefs = { ...demoPrefs, ...body } as NotificationPrefsMatrix;
  return NextResponse.json({ data: demoPrefs });
}
