/**
 * POST /api/team/invite — invite a new staff member by email (Day 46).
 * Body: { email: string, role: UserRole }
 *
 * Sends the branded invitation email via Resend when RESEND_API_KEY is
 * configured; otherwise mock-sends (logs + returns success), same
 * convention as /api/bulletin/send.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createInvitation } from '@/lib/church-store';
import { getBranding } from '@/lib/church-store';
import { renderInvitationEmailHtml } from '@/lib/invitation-email';
import { INVITABLE_ROLES } from '@/lib/team';
import type { UserRole } from '@/lib/site';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CHURCH_NAME = 'Elevanda Chapel Accra';
const INVITER_NAME = 'Solomon Leek';

export async function POST(request: NextRequest) {
  let body: { email?: string; role?: UserRole };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (!body.email || !emailPattern.test(body.email)) {
    return NextResponse.json({ error: 'validation_error', message: 'Enter a valid email address.' }, { status: 400 });
  }
  if (!body.role || !INVITABLE_ROLES.includes(body.role)) {
    return NextResponse.json({ error: 'validation_error', message: 'Choose a role.' }, { status: 400 });
  }

  const invite = createInvitation(body.email, body.role, INVITER_NAME);
  const acceptUrl = `${request.nextUrl.origin}/invite/${invite.token}`;
  const html = renderInvitationEmailHtml({
    churchName: CHURCH_NAME,
    branding: getBranding(),
    inviterName: INVITER_NAME,
    role: invite.role,
    acceptUrl,
  });

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: `${CHURCH_NAME} <invitations@resend.dev>`,
          to: body.email,
          subject: `You're invited to join ${CHURCH_NAME} on Elevanda ChMS`,
          html,
        }),
      });
      if (!res.ok) throw new Error(`Resend responded ${res.status}`);
      return NextResponse.json({ data: invite, mock: false }, { status: 201 });
    } catch (err) {
      console.warn('[api/team/invite] Resend send failed, falling back to mock:', err);
    }
  }

  console.log(`[mock] Invitation email sent to ${body.email} for role "${invite.role}" — accept at ${acceptUrl}`);
  return NextResponse.json({ data: invite, mock: true, acceptUrl }, { status: 201 });
}
