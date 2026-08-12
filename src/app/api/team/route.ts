/**
 * GET /api/team — staff roster (Day 46): name, role, last active, status.
 */
import { NextResponse } from 'next/server';
import { listStaff } from '@/lib/church-store';

export async function GET() {
  return NextResponse.json({ data: listStaff() });
}
