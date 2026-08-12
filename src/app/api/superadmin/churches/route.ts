/**
 * GET /api/superadmin/churches — full church registry for the platform
 * management table (Day 41). Falls back to mock data when Supabase env
 * vars are absent, same convention as every other API route in the app.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { timeoutFetch, disablePostgrestRetry } from '@/lib/supabase/timeout-fetch';
import { mockChurches, type SuperadminChurch } from '@/lib/superadmin';

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ data: mockChurches });
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
    const { data: churches, error } = await supabase
      .from('churches')
      .select('id, name, denomination, plan, contact_name, contact_email, country, created_at');

    if (error || !churches || churches.length === 0) {
      return NextResponse.json({ data: mockChurches });
    }

    const churchIds = churches.map((c) => c.id as string);

    const [{ data: profiles }, { data: subs }, { data: memberCounts }] = await Promise.all([
      supabase.from('church_profiles').select('*').in('church_id', churchIds),
      supabase.from('subscriptions').select('*').in('church_id', churchIds),
      supabase.from('members').select('church_id').in('church_id', churchIds),
    ]);

    const profileByChurch = new Map((profiles ?? []).map((p) => [p.church_id as string, p]));
    const subByChurch = new Map((subs ?? []).map((s) => [s.church_id as string, s]));
    const counts = new Map<string, number>();
    (memberCounts ?? []).forEach((m) => {
      const id = m.church_id as string;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    });

    const data: SuperadminChurch[] = churches.map((c) => {
      const profile = profileByChurch.get(c.id as string);
      const sub = subByChurch.get(c.id as string);
      const status: SuperadminChurch['status'] = profile?.is_suspended
        ? 'suspended'
        : sub?.status === 'canceled'
          ? 'churned'
          : sub?.status === 'trialing'
            ? 'trial'
            : 'active';

      return {
        id: c.id as string,
        name: c.name as string,
        denomination: (c.denomination as string) ?? '',
        plan: (sub?.plan as SuperadminChurch['plan']) ?? ((c.plan as SuperadminChurch['plan']) ?? 'community'),
        status,
        membersCount: counts.get(c.id as string) ?? 0,
        country: (c.country as string) ?? '',
        city: '',
        latitude: profile?.latitude != null ? Number(profile.latitude) : 0,
        longitude: profile?.longitude != null ? Number(profile.longitude) : 0,
        mrr: sub?.mrr != null ? Number(sub.mrr) : 0,
        lastActiveAt: (c.created_at as string) ?? new Date().toISOString(),
        contactName: (c.contact_name as string) ?? '',
        contactEmail: (c.contact_email as string) ?? '',
        createdAt: (c.created_at as string) ?? new Date().toISOString(),
      };
    });

    return NextResponse.json({ data });
  } catch (err) {
    console.warn('[api/superadmin/churches] query failed, falling back to mock:', err);
    return NextResponse.json({ data: mockChurches });
  }
}
