/**
 * GET /api/superadmin/audit-log — every recorded superadmin action, newest
 * first (suspend/restore, plan changes, feature-flag toggles).
 */
import { NextResponse } from 'next/server';
import { listAuditLog } from '@/lib/superadmin-store';

export async function GET() {
  const data = [...listAuditLog()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  return NextResponse.json({ data });
}
