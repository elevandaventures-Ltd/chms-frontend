/**
 * GET   /api/billing/subscription — current plan, status, and renewal date
 *       for the signed-in church (Day 42).
 * PATCH /api/billing/subscription — upgrade/downgrade to a different plan.
 *       Body: { plan: 'community'|'growth'|'enterprise' }
 */
import { NextResponse, type NextRequest } from 'next/server';
import { getSubscription, changeSubscriptionPlan } from '@/lib/superadmin-store';
import type { ChurchPlan } from '@/lib/superadmin';

const DEMO_CHURCH_ID = 'c1';

export async function GET() {
  return NextResponse.json({ data: getSubscription(DEMO_CHURCH_ID) });
}

export async function PATCH(request: NextRequest) {
  let body: { plan?: ChurchPlan };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (!body.plan || !['community', 'growth', 'enterprise'].includes(body.plan)) {
    return NextResponse.json({ error: 'validation_error' }, { status: 400 });
  }

  const data = changeSubscriptionPlan(DEMO_CHURCH_ID, body.plan);
  return NextResponse.json({ data });
}
