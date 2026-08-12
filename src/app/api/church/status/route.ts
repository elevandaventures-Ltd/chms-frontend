/**
 * GET /api/church/status — is the current church suspended by the
 * platform owner? Powers the read-only banner in AdminShell (Day 43).
 *
 * Dev/mock mode has no multi-tenant session, so it reports the status of
 * the demo "home" church (c1) — the same church the superadmin churches
 * table lets you suspend/restore for the review flow.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { timeoutFetch, disablePostgrestRetry } from '@/lib/supabase/timeout-fetch';
import { getChurch } from '@/lib/superadmin-store';

const DEMO_CHURCH_ID = 'c1';

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    const church = getChurch(DEMO_CHURCH_ID);
    return NextResponse.json({ isSuspended: church?.status === 'suspended' });
  }

  const response = NextResponse.next();
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookies: { name: string; value: string; options?: CookieOptions }[]) {
        cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options ?? {}));
      },
    },
    global: { fetch: timeoutFetch },
  });
  disablePostgrestRetry(supabase);

  try {
    const { data: role } = await supabase.auth.getUser();
    const userId = role.user?.id;
    if (!userId) return NextResponse.json({ isSuspended: false });

    const { data: churchRole } = await supabase
      .from('user_church_roles')
      .select('church_id')
      .eq('user_id', userId)
      .limit(1)
      .single();

    if (!churchRole) return NextResponse.json({ isSuspended: false });

    const { data: profile } = await supabase
      .from('church_profiles')
      .select('is_suspended')
      .eq('church_id', churchRole.church_id)
      .single();

    return NextResponse.json({ isSuspended: Boolean(profile?.is_suspended) });
  } catch {
    return NextResponse.json({ isSuspended: false });
  }
}
