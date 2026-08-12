/**
 * POST /api/attendance/sessions/:id/checkin — record a member check-in.
 *
 * Body (JSON): { memberId: string }
 *
 * Inserts an attendance_records row (idempotent per member+session) and returns
 * the member's name/photo so the scanner can show its success animation, plus
 * the session's updated count. Falls back to mock members when Supabase env vars
 * are absent.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { timeoutFetch, disablePostgrestRetry } from '@/lib/supabase/timeout-fetch';
import { mockMembers } from '@/lib/site';
import { z } from 'zod';

type RouteCtx = { params: Promise<{ id: string }> };

const bodySchema = z.object({ memberId: z.string().min(1) });

export async function POST(request: NextRequest, ctx: RouteCtx) {
  const { id: sessionId } = await ctx.params;

  try {
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Missing member id.' }, { status: 422 });
    }
    const { memberId } = parsed.data;

    const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // ── Mock fallback ──────────────────────────────────────────────────────
    if (!supabaseUrl || !supabaseAnonKey) {
      const m = mockMembers.find((x) => x.id === memberId);
      if (!m) return NextResponse.json({ error: 'Member not found.' }, { status: 404 });
      return NextResponse.json({
        member: { id: m.id, fullName: m.fullName, photoUrl: m.photoUrl ?? null },
        alreadyCheckedIn: false,
        source: 'mock',
      });
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

    // Verify the member exists (and isn't soft-deleted).
    const { data: member, error: memberErr } = await supabase
      .from('members')
      .select('id, full_name, photo_url')
      .eq('id', memberId)
      .is('deleted_at', null)
      .single();
    if (memberErr || !member) {
      return NextResponse.json({ error: 'Member not found.' }, { status: 404 });
    }

    // Insert the check-in. The unique (session_id, member_id) index makes a
    // repeat scan a no-op rather than an error.
    const { error: insertErr } = await supabase
      .from('attendance_records')
      .insert({ session_id: sessionId, member_id: memberId });

    let alreadyCheckedIn = false;
    if (insertErr) {
      // 23505 = unique_violation → already checked in for this session.
      if ((insertErr as { code?: string }).code === '23505') alreadyCheckedIn = true;
      else throw insertErr;
    }

    // Read back the session count (kept current by the DB trigger).
    const { data: session } = await supabase
      .from('attendance_sessions')
      .select('count')
      .eq('id', sessionId)
      .single();

    return NextResponse.json({
      member: { id: member.id, fullName: member.full_name, photoUrl: member.photo_url ?? null },
      alreadyCheckedIn,
      count: session?.count ?? null,
      source: 'supabase',
    });
  } catch (err) {
    console.error('[api/attendance/sessions/:id/checkin POST] error:', err);
    return NextResponse.json({ error: 'Failed to record check-in.' }, { status: 500 });
  }
}
