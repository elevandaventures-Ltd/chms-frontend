/**
 * PATCH /api/members/:id/status — change a member's status.
 *
 * Body (JSON): { status: 'active'|'inactive'|'visitor', reason?: string }
 *
 * Records the transition in member_status_history. When a member is
 * re-activated, any open aging alerts for them are auto-resolved.
 * Falls back to a no-op success when Supabase env vars are absent.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { statusChangeSchema } from '@/lib/member-schema';

type RouteCtx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, ctx: RouteCtx) {
  const { id } = await ctx.params;

  try {
    const parsed = statusChangeSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed.', issues: parsed.error.flatten().fieldErrors },
        { status: 422 },
      );
    }
    const { status, reason } = parsed.data;

    const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // ── Mock fallback ──────────────────────────────────────────────────────
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ id, status });
    }

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

    // Current status + church for the history row.
    const { data: existing, error: fetchErr } = await supabase
      .from('members')
      .select('status, church_id')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (fetchErr || !existing) {
      return NextResponse.json({ error: 'Member not found.' }, { status: 404 });
    }

    const fromStatus = existing.status as string;

    // No-op guard — nothing to record if the status is unchanged.
    if (fromStatus === status) {
      return NextResponse.json({ id, status });
    }

    const { error: updateErr } = await supabase
      .from('members')
      .update({ status })
      .eq('id', id);

    if (updateErr) throw updateErr;

    // Record the transition. Don't fail the request if history insert fails
    // (table may not exist yet on older deployments) — log and continue.
    const { data: auth } = await supabase.auth.getUser();
    const { error: historyErr } = await supabase
      .from('member_status_history')
      .insert({
        member_id:   id,
        church_id:   existing.church_id,
        from_status: fromStatus,
        to_status:   status,
        reason:      reason ?? null,
        changed_by:  auth?.user?.id ?? null,
      });
    if (historyErr) console.warn('[api/members/:id/status] history insert failed:', historyErr.message);

    // Re-activation clears any open aging alerts.
    if (status === 'active') {
      const { error: alertErr } = await supabase
        .from('member_alerts')
        .update({ status: 'resolved', resolved_at: new Date().toISOString() })
        .eq('member_id', id)
        .eq('status', 'open');
      if (alertErr) console.warn('[api/members/:id/status] alert resolve failed:', alertErr.message);
    }

    return NextResponse.json({ id, status });
  } catch (err) {
    console.error('[api/members/:id/status PATCH] error:', err);
    return NextResponse.json({ error: 'Failed to change status.' }, { status: 500 });
  }
}
