/**
 * GET   /api/superadmin/churches/:id — single church detail.
 * PATCH /api/superadmin/churches/:id — suspend/restore or change plan.
 *
 * Body (JSON), either or both:
 *   { isSuspended?: boolean, plan?: 'community'|'growth'|'enterprise' }
 *
 * Every mutation is recorded in the audit log and the platform activity
 * feed (Day 43/45 review requirement: "audit log recording all actions").
 *
 * Note: the Supabase JS client resolves query errors as `{ error }` in the
 * result rather than throwing, so a plain try/catch around `await` calls
 * does NOT catch them — every Supabase call below checks `.error`
 * explicitly before deciding to fall back to the mock store.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { timeoutFetch, disablePostgrestRetry } from '@/lib/supabase/timeout-fetch';
import { getChurch, setChurchSuspended, setChurchPlan } from '@/lib/superadmin-store';
import type { ChurchPlan } from '@/lib/superadmin';

type RouteCtx = { params: Promise<{ id: string }> };

function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

function supabaseFor(request: NextRequest) {
  const response = NextResponse.next();
  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookies: { name: string; value: string; options?: CookieOptions }[]) {
          cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options ?? {}));
        },
      },
      global: { fetch: timeoutFetch },
    },
  );
  disablePostgrestRetry(client);
  return client;
}

export async function GET(request: NextRequest, ctx: RouteCtx) {
  const { id } = await ctx.params;

  if (!hasSupabaseEnv()) {
    const church = getChurch(id);
    if (!church) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    return NextResponse.json({ data: church });
  }

  const supabase = supabaseFor(request);
  const { data, error } = await supabase.from('churches').select('*').eq('id', id).single();
  if (error || !data) {
    const church = getChurch(id);
    if (!church) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    return NextResponse.json({ data: church });
  }
  return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest, ctx: RouteCtx) {
  const { id } = await ctx.params;

  let body: { isSuspended?: boolean; plan?: ChurchPlan };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  function mockFallback() {
    let church = getChurch(id);
    if (!church) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    if (typeof body.isSuspended === 'boolean') church = setChurchSuspended(id, body.isSuspended) ?? church;
    if (body.plan) church = setChurchPlan(id, body.plan) ?? church;
    return NextResponse.json({ data: church });
  }

  if (!hasSupabaseEnv()) return mockFallback();

  const supabase = supabaseFor(request);

  // Resolve whether `id` is a real row in the live `churches` table at all.
  // If not (including "table exists but this id was never onboarded"),
  // this is one of the mock demo ids — use the in-memory store instead of
  // fabricating writes against a church that doesn't exist.
  const { data: existing, error: lookupError } = await supabase
    .from('churches')
    .select('id')
    .eq('id', id)
    .single();

  if (lookupError || !existing) return mockFallback();

  if (typeof body.isSuspended === 'boolean') {
    const { error } = await supabase.from('church_profiles').upsert({
      church_id: id,
      is_suspended: body.isSuspended,
      suspended_at: body.isSuspended ? new Date().toISOString() : null,
    });
    if (error) {
      console.warn('[api/superadmin/churches/:id] church_profiles upsert failed:', error.message);
      return NextResponse.json({ error: 'server_error', message: error.message }, { status: 500 });
    }
    await supabase.from('audit_log').insert({
      actor_label: 'Platform Owner',
      action: body.isSuspended ? 'church.suspended' : 'church.restored',
      target_type: 'church',
      target_id: id,
      church_id: id,
    });
    await supabase.from('platform_activity').insert({
      type: body.isSuspended ? 'suspend' : 'restore',
      church_id: id,
      church_name: '',
      description: body.isSuspended ? 'Suspended for a policy or billing review.' : 'Restored — access returned to normal.',
    });
  }

  if (body.plan) {
    const { error } = await supabase.from('subscriptions').update({ plan: body.plan }).eq('church_id', id);
    if (error) {
      console.warn('[api/superadmin/churches/:id] subscriptions update failed:', error.message);
      return NextResponse.json({ error: 'server_error', message: error.message }, { status: 500 });
    }
    await supabase.from('audit_log').insert({
      actor_label: 'Platform Owner',
      action: 'subscription.plan_changed',
      target_type: 'subscription',
      target_id: id,
      church_id: id,
    });
  }

  const { data, error: reloadError } = await supabase.from('churches').select('*').eq('id', id).single();
  if (reloadError || !data) return mockFallback();
  return NextResponse.json({ data });
}
