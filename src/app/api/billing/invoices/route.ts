/**
 * GET /api/billing/invoices — billing history for the signed-in church
 * (Day 42): date, amount, status (paid/failed/refunded), newest first.
 */
import { NextResponse } from 'next/server';
import { listInvoices } from '@/lib/superadmin-store';

const DEMO_CHURCH_ID = 'c1';

export async function GET() {
  const data = [...listInvoices(DEMO_CHURCH_ID)].sort(
    (a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime(),
  );
  return NextResponse.json({ data });
}
