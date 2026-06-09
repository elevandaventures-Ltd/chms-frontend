/**
 * GET /api/members
 *
 * Returns a paginated, filtered list of church members.
 *
 * Query params:
 *   page     (number, default 1)
 *   pageSize (number, default 12, max 48)
 *   status   ('active' | 'inactive' | 'visitor' | 'all', default 'all')
 *   q        (search string — matches full_name, email, ministries)
 *
 * Response:
 *   200 { data: Member[], total: number, page: number, pageSize: number }
 *   500 { error: string }
 *
 * When Supabase env vars are absent, falls back to the mock data in
 * src/lib/site.ts so the directory works in dev without credentials.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { mockMembers } from '@/lib/site';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const page     = Math.max(1, parseInt(searchParams.get('page')     ?? '1', 10));
  const pageSize = Math.min(48, Math.max(1, parseInt(searchParams.get('pageSize') ?? '12', 10)));
  const status   = searchParams.get('status') ?? 'all';
  const q        = searchParams.get('q')?.trim().toLowerCase() ?? '';

  const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // ── Fallback to mock data when Supabase is not configured ─────────────────
  if (!supabaseUrl || !supabaseAnonKey) {
    let results = mockMembers;

    if (status !== 'all') {
      results = results.filter((m) => m.status === status);
    }

    if (q) {
      results = results.filter(
        (m) =>
          m.fullName.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.ministries.some((t) => t.toLowerCase().includes(q)),
      );
    }

    const total = results.length;
    const from  = (page - 1) * pageSize;
    const data  = results.slice(from, from + pageSize);

    return NextResponse.json({ data, total, page, pageSize });
  }

  // ── Supabase query ────────────────────────────────────────────────────────
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

  try {
    let query = supabase
      .from('members')
      .select('*', { count: 'exact' })
      .order('full_name', { ascending: true })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (q) {
      // Supabase full-text search on name + email; ministries searched client-side
      query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);
    }

    const { data, count, error } = await query;

    if (error) throw error;

    // Map snake_case DB columns to camelCase Member type
    const members = (data ?? []).map((row) => ({
      id:          row.id,
      fullName:    row.full_name,
      email:       row.email,
      phone:       row.phone ?? undefined,
      photoUrl:    row.photo_url ?? undefined,
      status:      row.status,
      role:        row.role,
      ministries:  row.ministries ?? [],
      joinedDate:  row.joined_date,
      notes:       row.notes ?? undefined,
    }));

    return NextResponse.json({ data: members, total: count ?? 0, page, pageSize });
  } catch (err) {
    console.error('[api/members] error:', err);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}
