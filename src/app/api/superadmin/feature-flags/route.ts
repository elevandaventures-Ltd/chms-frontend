/**
 * GET   /api/superadmin/feature-flags?churchId=xxx — flag catalog + this
 *       church's on/off state and last-changed timestamp (Day 44).
 * PATCH /api/superadmin/feature-flags — toggle one flag for one church.
 *       Body: { churchId: string, flagKey: string, enabled: boolean }
 */
import { NextResponse, type NextRequest } from 'next/server';
import { featureFlagCatalog, type FeatureFlagKey } from '@/lib/superadmin';
import { listChurchFlags, setChurchFlag } from '@/lib/superadmin-store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const churchId = searchParams.get('churchId');

  if (!churchId) {
    return NextResponse.json({ data: featureFlagCatalog });
  }

  const state = listChurchFlags(churchId);
  const data = featureFlagCatalog.map((flag) => {
    const s = state.find((x) => x.flagKey === flag.key);
    return {
      ...flag,
      enabled: s?.enabled ?? true,
      changedAt: s?.changedAt ?? null,
      changedBy: s?.changedBy ?? null,
    };
  });

  return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest) {
  let body: { churchId?: string; flagKey?: string; enabled?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (!body.churchId || !body.flagKey || typeof body.enabled !== 'boolean') {
    return NextResponse.json({ error: 'validation_error' }, { status: 400 });
  }

  const state = setChurchFlag(body.churchId, body.flagKey as FeatureFlagKey, body.enabled);
  return NextResponse.json({ data: state });
}
