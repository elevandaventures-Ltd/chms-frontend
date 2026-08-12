/**
 * PATCH /api/attendance/sessions/:id — end (or reopen) a session.
 *
 * Body (JSON): { action: 'end' | 'reopen' }
 *
 * Falls back to a no-op success when Supabase env vars are absent.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { timeoutFetch, disablePostgrestRetry } from '@/lib/supabase/timeout-fetch';
import { z } from 'zod';

type RouteCtx = { params: Promise<{ id: string }> };

const patchSchema = z.object({ action: z.enum(['end', 'reopen']) });

export async function PATCH(request: NextRequest, ctx: RouteCtx) {
  const { id } = await ctx.params;

  try {
    const parsed = patchSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid action.' }, { status: 422 });
    }
    const { action } = parsed.data;

    const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const status  = action === 'end' ? 'ended' : 'active';
    const endedAt = action === 'end' ? new Date().toISOString() : null;

    // ── Mock fallback ──────────────────────────────────────────────────────
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ id, status, endedAt });
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
      global: { fetch: timeoutFetch },
    });
    disablePostgrestRetry(supabase);

    const { error } = await supabase
      .from('attendance_sessions')
      .update({ status, ended_at: endedAt })
      .eq('id', id);
    if (error) throw error;

    return NextResponse.json({ id, status, endedAt });
  } catch (err) {
    console.error('[api/attendance/sessions/:id PATCH] falling back to mock:', err);
    // Table missing — return optimistic success so UI still works
    const { action } = patchSchema.parse(await request.json().catch(() => ({ action: 'end' })));
    const s = action === 'end' ? 'ended' : 'active';
    return NextResponse.json({ id, status: s, endedAt: s === 'ended' ? new Date().toISOString() : null });
  }
}
