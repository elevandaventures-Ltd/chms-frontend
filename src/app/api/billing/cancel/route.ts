/**
 * POST /api/billing/cancel — schedule (or revert) cancellation at the end
 * of the current billing period. Body: { cancel: boolean }
 */
import { NextResponse, type NextRequest } from 'next/server';
import { setSubscriptionCancelAtPeriodEnd } from '@/lib/superadmin-store';

const DEMO_CHURCH_ID = 'c1';

export async function POST(request: NextRequest) {
  let body: { cancel?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const data = setSubscriptionCancelAtPeriodEnd(DEMO_CHURCH_ID, body.cancel !== false);
  return NextResponse.json({ data });
}
