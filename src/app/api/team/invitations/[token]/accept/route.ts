/**
 * POST /api/team/invitations/:token/accept — accept a staff invitation
 * (Day 46 review: "click accept link; new staff appears in team
 * management table with correct role").
 */
import { NextResponse, type NextRequest } from 'next/server';
import { acceptInvitation } from '@/lib/church-store';

type RouteCtx = { params: Promise<{ token: string }> };

export async function POST(_request: NextRequest, ctx: RouteCtx) {
  const { token } = await ctx.params;
  const staff = acceptInvitation(token);
  if (!staff) return NextResponse.json({ error: 'invalid_or_used_token' }, { status: 400 });
  return NextResponse.json({ data: staff });
}
