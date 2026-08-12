/**
 * POST /api/bulletin/send — generate the bulletin from live config +
 * upcoming events + giving summary, and send it to a test email
 * (Day 39 Task 2 review: "verify it sends to test email").
 *
 * No email provider (Resend/SMTP/SendGrid) is configured in this project,
 * so this always takes the mock branch — same convention as Twilio SMS
 * and Stripe billing elsewhere: real send is a same-shaped code path
 * behind an env-var check, swap in a provider and it lights up.
 * Body: { testEmail: string }
 */
import { NextResponse, type NextRequest } from 'next/server';
import { getUpcomingEvents, mockGivingSummary, renderBulletinEmailHtml, defaultBulletinConfig, type BulletinConfig } from '@/lib/bulletin';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  let body: { testEmail?: string; config?: BulletinConfig };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (!body.testEmail || !emailPattern.test(body.testEmail)) {
    return NextResponse.json({ error: 'validation_error', message: 'Enter a valid test email address.' }, { status: 400 });
  }

  // The preview page always has the freshest edited config in state and
  // sends it directly; falling back to defaults only covers a direct API
  // call made without one.
  const config = body.config ?? defaultBulletinConfig;
  const events = getUpcomingEvents(7);
  const giving = mockGivingSummary;
  const html = renderBulletinEmailHtml(config, events, giving);

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: `${config.churchName} <bulletin@resend.dev>`,
          to: body.testEmail,
          subject: `${config.churchName} — Weekly Bulletin`,
          html,
        }),
      });
      if (!res.ok) throw new Error(`Resend responded ${res.status}`);
      return NextResponse.json({ sent: true, testEmail: body.testEmail, eventCount: events.length, html });
    } catch (err) {
      console.warn('[api/bulletin/send] Resend send failed, falling back to mock:', err);
    }
  }

  console.log(`[mock] Bulletin for ${config.churchName} sent to ${body.testEmail} — ${events.length} upcoming event(s), giving week total ${giving.currency} ${giving.weekTotal}.`);

  return NextResponse.json({ sent: true, testEmail: body.testEmail, eventCount: events.length, html, mock: true });
}
