/**
 * GET /api/superadmin/support-volume — weekly support ticket volume
 * (opened vs. resolved) for the Day 45 trend chart.
 */
import { NextResponse } from 'next/server';
import { supportVolumeTrend } from '@/lib/superadmin';

export async function GET() {
  return NextResponse.json({ data: supportVolumeTrend });
}
