/**
 * GET /api/superadmin/metrics — platform health metrics (Day 43): MRR, ARR,
 * active churches, new signups this month, churned churches, plus the
 * 12-month MRR/ARR trend and new-signups-by-month series for the charts.
 */
import { NextResponse } from 'next/server';
import { computePlatformMetrics, mrrTrend, signupsByMonth } from '@/lib/superadmin';
import { listChurches } from '@/lib/superadmin-store';

export async function GET() {
  const churches = listChurches();
  const metrics = computePlatformMetrics(churches);
  return NextResponse.json({ data: { ...metrics, mrrTrend, signupsByMonth } });
}
