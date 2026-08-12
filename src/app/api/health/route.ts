/**
 * GET /api/health — connectivity ping endpoint (Day 54).
 *
 * Used by lib/connectivity.ts to confirm the server is reachable.
 * Must return 200 so the health-ping loop doesn't flip the app into
 * "offline" mode and cause the dashboard to shake every 30 seconds.
 */
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ ok: true, ts: Date.now() });
}
