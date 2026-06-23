/**
 * POST /api/members/messages — send a message to many members at once.
 *
 * Body (JSON): { ids: string[], channel: 'sms' | 'email', message: string }
 *
 * SMS is delivered via Twilio (per recipient with a phone number). Email has no
 * provider wired yet, so it is counted but not dispatched. Recipients missing
 * the relevant contact field are skipped. Falls back to mock contacts when
 * Supabase env vars are absent.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { mockMembers } from '@/lib/site';
import { z } from 'zod';

const bodySchema = z.object({
  ids:     z.array(z.string().min(1)).min(1, 'No recipients selected.'),
  channel: z.enum(['sms', 'email']),
  message: z.string().trim().min(1, 'Message is required.').max(2000),
});

type Contact = { id: string; phone?: string | null; email?: string | null };

async function sendSms(to: string, body: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const from       = process.env.TWILIO_PHONE_NUMBER;

  // Not configured — treat as a successful no-op so dev/mock flows still report
  // a send count (mirrors the welcome-SMS behaviour in /api/members POST).
  if (!accountSid || !authToken || !from) return true;

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
    },
  );
  if (!res.ok) console.warn('[api/members/messages] Twilio send failed:', await res.text());
  return res.ok;
}

export async function POST(request: NextRequest) {
  try {
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed.', issues: parsed.error.flatten().fieldErrors },
        { status: 422 },
      );
    }
    const { ids, channel, message } = parsed.data;

    const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Resolve recipient contact details.
    let contacts: Contact[];
    if (!supabaseUrl || !supabaseAnonKey) {
      const set = new Set(ids);
      contacts = mockMembers.filter((m) => set.has(m.id)).map((m) => ({ id: m.id, phone: m.phone, email: m.email }));
    } else {
      const response = NextResponse.next();
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll(cookies: { name: string; value: string; options?: CookieOptions }[]) {
            cookies.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options ?? {}),
            );
          },
        },
      });
      const { data, error } = await supabase
        .from('members')
        .select('id, phone, email')
        .in('id', ids)
        .is('deleted_at', null);
      if (error) throw error;
      contacts = data ?? [];
    }

    const reachable = contacts.filter((c) => (channel === 'sms' ? Boolean(c.phone) : Boolean(c.email)));
    const skipped   = contacts.length - reachable.length;

    let sent = 0;
    if (channel === 'sms') {
      const results = await Promise.all(reachable.map((c) => sendSms(c.phone as string, message)));
      sent = results.filter(Boolean).length;
    } else {
      // No email provider yet — count as queued so the UI can confirm intent.
      sent = reachable.length;
    }

    return NextResponse.json({ sent, skipped, channel });
  } catch (err) {
    console.error('[api/members/messages POST] error:', err);
    return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 });
  }
}
