/**
 * GET  /api/unsubscribe?token=xxx — look up notification preferences by a
 *      member's capability token (Day 40). No login required.
 * POST /api/unsubscribe — update preferences for that token.
 *      Body: { token, smsEnabled, emailEnabled, whatsappEnabled, pushEnabled, categories }
 *
 * Security note: this table has no anon RLS policy (see the migration) —
 * a public capability token must never be checked via a client-side
 * Supabase call gated by "using (true)", since the anon key is public and
 * that would let anyone dump every member's token. This route uses the
 * service-role key server-side (bypassing RLS) when configured, and a
 * generic mock response otherwise — the anon key is never used here.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

type Categories = { announcements: boolean; events: boolean; newsletter: boolean; giving: boolean };

type Prefs = {
  token: string;
  memberName: string;
  churchName: string;
  smsEnabled: boolean;
  emailEnabled: boolean;
  whatsappEnabled: boolean;
  pushEnabled: boolean;
  categories: Categories;
};

const mockPrefsByToken = new Map<string, Prefs>();

function mockPrefsFor(token: string): Prefs {
  return mockPrefsByToken.get(token) ?? {
    token,
    memberName: 'Demo Member',
    churchName: 'Elevanda Chapel Accra',
    smsEnabled: true,
    emailEnabled: true,
    whatsappEnabled: true,
    pushEnabled: true,
    categories: { announcements: true, events: true, newsletter: true, giving: true },
  };
}

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

export async function GET(request: NextRequest) {
  const token = new URL(request.url).searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'missing_token' }, { status: 400 });

  const supabase = serviceClient();
  if (!supabase) return NextResponse.json({ data: mockPrefsFor(token) });

  try {
    const { data, error } = await supabase
      .from('member_notification_prefs')
      .select('member_id, sms_enabled, email_enabled, whatsapp_enabled, push_enabled, categories, members(full_name, church_id, churches(name))')
      .eq('unsub_token', token)
      .single();

    if (error || !data) return NextResponse.json({ error: 'not_found' }, { status: 404 });

    const member = data.members as unknown as { full_name?: string; churches?: { name?: string } } | null;

    return NextResponse.json({
      data: {
        token,
        memberName: member?.full_name ?? 'Member',
        churchName: member?.churches?.name ?? 'Your church',
        smsEnabled: data.sms_enabled,
        emailEnabled: data.email_enabled,
        whatsappEnabled: data.whatsapp_enabled,
        pushEnabled: data.push_enabled,
        categories: data.categories,
      },
    });
  } catch {
    return NextResponse.json({ data: mockPrefsFor(token) });
  }
}

export async function POST(request: NextRequest) {
  let body: Partial<Prefs>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  if (!body.token) return NextResponse.json({ error: 'missing_token' }, { status: 400 });

  const supabase = serviceClient();
  if (!supabase) {
    const next = { ...mockPrefsFor(body.token), ...body, token: body.token };
    mockPrefsByToken.set(body.token, next);
    return NextResponse.json({ data: next });
  }

  try {
    const { data: existing } = await supabase
      .from('member_notification_prefs')
      .select('member_id')
      .eq('unsub_token', body.token)
      .single();

    if (!existing) return NextResponse.json({ error: 'not_found' }, { status: 404 });

    await supabase
      .from('member_notification_prefs')
      .update({
        sms_enabled: body.smsEnabled,
        email_enabled: body.emailEnabled,
        whatsapp_enabled: body.whatsappEnabled,
        push_enabled: body.pushEnabled,
        categories: body.categories,
      })
      .eq('unsub_token', body.token);

    return NextResponse.json({ data: { ...body } });
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
