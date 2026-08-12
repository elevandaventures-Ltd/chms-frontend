/**
 * GET /api/team/invitations — pending/accepted invitations list.
 */
import { NextResponse } from 'next/server';
import { listInvitations } from '@/lib/church-store';

export async function GET() {
  return NextResponse.json({ data: listInvitations() });
}
