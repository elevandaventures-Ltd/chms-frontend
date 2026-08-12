/**
 * GET /api/church/feature-flags — which feature flags are enabled for the
 * current church (Day 44). Powers sidebar gating — e.g. hiding
 * Communication when `communication_channels` is turned off.
 *
 * Dev/mock mode reports flags for the demo "home" church (c1) — see
 * /api/church/status for why.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { timeoutFetch, disablePostgrestRetry } from '@/lib/supabase/timeout-fetch';
import { featureFlagCatalog } from '@/lib/superadmin';
import { listChurchFlags } from '@/lib/superadmin-store';

const DEMO_CHURCH_ID = 'c1';

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    const state = listChurchFlags(DEMO_CHURCH_ID);
    const enabled = featureFlagCatalog
      .filter((f) => (state.find((s) => s.flagKey === f.key)?.enabled ?? true))
      .map((f) => f.key);
    return NextResponse.json({ enabled });
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
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return NextResponse.json({ enabled: featureFlagCatalog.map((f) => f.key) });

    const { data: churchRole } = await supabase
      .from('user_church_roles')
      .select('church_id')
      .eq('user_id', userId)
      .limit(1)
      .single();

    if (!churchRole) return NextResponse.json({ enabled: featureFlagCatalog.map((f) => f.key) });

    const { data: flags } = await supabase
      .from('church_feature_flags')
      .select('flag_key, enabled')
      .eq('church_id', churchRole.church_id);

    const disabledKeys = new Set((flags ?? []).filter((f) => !f.enabled).map((f) => f.flag_key as string));
    const enabled = featureFlagCatalog.filter((f) => !disabledKeys.has(f.key)).map((f) => f.key);
    return NextResponse.json({ enabled });
  } catch {
    return NextResponse.json({ enabled: featureFlagCatalog.map((f) => f.key) });
  }
}
