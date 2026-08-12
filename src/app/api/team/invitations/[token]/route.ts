/**
 * GET /api/team/invitations/:token — invitation details for the public
 * accept page (no login required — the token itself is the capability).
 */
import { NextResponse, type NextRequest } from 'next/server';
import { getInvitationByToken } from '@/lib/church-store';
import { ROLE_LABEL } from '@/lib/team';

type RouteCtx = { params: Promise<{ token: string }> };

export async function GET(_request: NextRequest, ctx: RouteCtx) {
  const { token } = await ctx.params;
  const invite = getInvitationByToken(token);
  if (!invite) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  return NextResponse.json({
    data: {
      email: invite.email,
      role: invite.role,
      roleLabel: ROLE_LABEL[invite.role],
      status: invite.status,
      invitedBy: invite.invitedBy,
    },
  });
}
