import { NextResponse, type NextRequest } from 'next/server';
import { mockMembers } from '@/lib/site';
import type { AgeGroup, MemberStatus } from '@/lib/site';

type Body = {
  channel:    string;
  subject?:   string;
  fromName?:  string;
  body:       string;
  trackOpens?: boolean;
  filters: {
    statuses:   MemberStatus[];
    ministries: string[];
    ageGroups:  AgeGroup[];
    zones:      string[];
  };
};

function injectTrackingPixel(html: string, reportId: string, baseUrl: string): string {
  const pixel = `<img src="${baseUrl}/api/communication/track/${reportId}" width="1" height="1" alt="" style="display:none" />`;
  // Insert before </body> if present, otherwise append
  return html.includes('</body>')
    ? html.replace('</body>', `${pixel}</body>`)
    : html + pixel;
}

export async function POST(request: NextRequest) {
  const { channel, subject, fromName, body: msgBody, filters, trackOpens } =
    await request.json() as Body;

  if (!msgBody?.trim()) {
    return NextResponse.json({ error: 'Message body is required.' }, { status: 400 });
  }

  let members = mockMembers;

  try {
    const { createSupabaseServerClient } = await import('@/lib/supabase/server');
    const response = NextResponse.next();
    const supabase = createSupabaseServerClient(request, response);
    const { data } = await supabase
      .from('members')
      .select('id,status,ministries,age_group,zone,phone,email,full_name');
    if (data && data.length > 0) members = data as unknown as typeof mockMembers;
  } catch { /* use mock */ }

  let targets = members;
  if (filters.statuses.length)   targets = targets.filter((m) => filters.statuses.includes(m.status));
  if (filters.ministries.length) targets = targets.filter((m) => m.ministries.some((min) => filters.ministries.includes(min)));
  if (filters.ageGroups.length)  targets = targets.filter((m) => m.ageGroup && filters.ageGroups.includes(m.ageGroup));
  if (filters.zones.length)      targets = targets.filter((m) => m.zone && filters.zones.includes(m.zone));

  if (channel === 'sms' || channel === 'whatsapp') targets = targets.filter((m) => Boolean(m.phone));
  else if (channel === 'email') targets = targets.filter((m) => Boolean(m.email));

  // Generate a report ID for tracking
  const reportId = `rpt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // Inject tracking pixel into HTML email body
  let finalBody = msgBody;
  if (channel === 'email' && trackOpens) {
    const baseUrl = request.nextUrl.origin;
    finalBody = injectTrackingPixel(msgBody, reportId, baseUrl);
  }

  // Attempt real Twilio send for SMS
  if (channel === 'sms') {
    const sid   = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from  = process.env.TWILIO_FROM_NUMBER;

    if (sid && token && from) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const twilio = (require('twilio') as (
        sid: string, token: string,
      ) => { messages: { create: (o: Record<string, string>) => Promise<unknown> } })(sid, token);
      await Promise.allSettled(
        targets.map((m) => twilio.messages.create({ body: finalBody, from, to: m.phone! })),
      );
    }
  }

  // Persist report row (best-effort)
  try {
    const { createSupabaseServerClient } = await import('@/lib/supabase/server');
    const response = NextResponse.next();
    const supabase = createSupabaseServerClient(request, response);
    await supabase.from('message_reports').insert({
      id:         reportId,
      channel,
      subject:    subject ?? null,
      from_name:  fromName ?? null,
      recipients: targets.length,
      delivered:  targets.length, // optimistic; real delivery webhooks update this
      opened:     0,
      sent_at:    new Date().toISOString(),
      status:     'sent',
    });
  } catch { /* Supabase absent — skip */ }

  console.log(`[mock] ${channel.toUpperCase()} to ${targets.length} recipients | id=${reportId}`);

  return NextResponse.json({
    sent:      targets.length,
    skipped:   members.length - targets.length,
    reportId,
  });
}
