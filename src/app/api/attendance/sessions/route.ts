/**
 * GET  /api/attendance/sessions — list sessions (optionally by status).
 * POST /api/attendance/sessions — start a new session.
 *
 * Falls back to mock test data when Supabase env vars are absent.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { timeoutFetch, disablePostgrestRetry } from '@/lib/supabase/timeout-fetch';
import { mockSessions, SESSION_TYPES, type AttendanceSession } from '@/lib/attendance';
import { z } from 'zod';

function rowToSession(row: Record<string, unknown>): AttendanceSession {
  return {
    id:        String(row.id),
    type:      row.type as AttendanceSession['type'],
    title:     (row.title as string) ?? undefined,
    status:    row.status as AttendanceSession['status'],
    date:      String(row.date),
    startedAt: String(row.started_at),
    endedAt:   (row.ended_at as string) ?? undefined,
    count:     Number(row.count ?? 0),
  };
}

function getSupabase(request: NextRequest, response: NextResponse) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const client = createServerClient(url, key, {
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
  disablePostgrestRetry(client);
  return client;
}

// ── GET ─────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') ?? 'all'; // active | ended | all

  const response = NextResponse.next();
  const supabase = getSupabase(request, response);

  // ── Mock fallback ──────────────────────────────────────────────────────
  if (!supabase) {
    const data = status === 'all' ? mockSessions : mockSessions.filter((s) => s.status === status);
    return NextResponse.json({ data, source: 'mock' });
  }

  try {
    let query = supabase
      .from('attendance_sessions')
      .select('*')
      .order('started_at', { ascending: false });
    if (status !== 'all') query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;

    // RLS returns 0 rows for unauthenticated requests — fall back to mock
    if (!data || data.length === 0) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('unauthenticated — use mock');
    }

    return NextResponse.json({ data: (data ?? []).map(rowToSession), source: 'supabase' });
  } catch (err) {
    console.error('[api/attendance/sessions GET] falling back to mock:', err);
    const data = status === 'all' ? mockSessions : mockSessions.filter((s) => s.status === status);
    return NextResponse.json({ data, source: 'mock' });
  }
}

// ── POST ────────────────────────────────────────────────────────────────────

const createSchema = z.object({
  type:  z.enum(SESSION_TYPES as [string, ...string[]]),
  title: z.string().trim().max(120).optional(),
  date:  z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const parsed = createSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed.', issues: parsed.error.flatten().fieldErrors },
        { status: 422 },
      );
    }
    const { type, title, date } = parsed.data;
    const now = new Date();
    const sessionDate = date ?? now.toISOString().slice(0, 10);

    const response = NextResponse.next();
    const supabase = getSupabase(request, response);

    // ── Mock fallback — return a created session the client can render ──────
    if (!supabase) {
      const session: AttendanceSession = {
        id:        `sess-${now.getTime()}`,
        type:      type as AttendanceSession['type'],
        title:     title || undefined,
        status:    'active',
        date:      sessionDate,
        startedAt: now.toISOString(),
        count:     0,
      };
      return NextResponse.json({ data: session, source: 'mock' }, { status: 201 });
    }

    const { data: auth } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('attendance_sessions')
      .insert({
        type,
        title:      title || null,
        status:     'active',
        date:       sessionDate,
        created_by: auth?.user?.id ?? null,
      })
      .select('*')
      .single();
    if (error || !data) throw error ?? new Error('Insert failed');

    return NextResponse.json({ data: rowToSession(data), source: 'supabase' }, { status: 201 });
  } catch (err) {
    console.error('[api/attendance/sessions POST] error:', err);
    return NextResponse.json({ error: 'Failed to start session.' }, { status: 500 });
  }
}
