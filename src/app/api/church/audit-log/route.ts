/**
 * GET /api/church/audit-log — this church's audit trail, newest first
 * (Day 48). Every mutation elsewhere in the app that calls
 * lib/church-store's addAuditEntry() shows up here immediately.
 */
import { NextResponse } from 'next/server';
import { listChurchAuditLog } from '@/lib/church-store';

export async function GET() {
  return NextResponse.json({ data: listChurchAuditLog() });
}
