/**
 * GET /api/superadmin/activity — recent platform activity feed (Day 45):
 * latest church signups, plan changes, suspensions, restores, and flag
 * changes, newest first.
 */
import { NextResponse } from 'next/server';
import { listActivity } from '@/lib/superadmin-store';

export async function GET() {
  const data = [...listActivity()]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20);
  return NextResponse.json({ data });
}
