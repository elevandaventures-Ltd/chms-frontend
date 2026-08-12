/**
 * GET /api/attendance/sessions/:id/checkins — list check-in records for a session (Day 25).
 */
import { NextResponse } from 'next/server';

export async function GET() {
  // Returns empty array — real data comes from Supabase attendance_records table
  return NextResponse.json({ data: [] });
}
