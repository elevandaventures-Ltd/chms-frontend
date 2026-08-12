/**
 * GET /api/church/ministries — this church's current ministry list
 * (global MINISTRIES plus anything seeded by denomination selection).
 */
import { NextResponse } from 'next/server';
import { listChurchMinistries } from '@/lib/church-store';

export async function GET() {
  return NextResponse.json({ data: listChurchMinistries() });
}
