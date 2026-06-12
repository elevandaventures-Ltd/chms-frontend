/**
 * GET /api/members
 *
 * Returns a paginated, filtered list of church members.
 *
 * Query params:
 *   page        (number, default 1)
 *   pageSize    (number, default 12, max 48)
 *   status      ('active'|'inactive'|'visitor'|'all')
 *   q           (search string)
 *   ministries  (comma-separated ministry names)
 *   ageGroups   (comma-separated: child|youth|young_adult|adult|senior)
 *   joinFrom    (ISO date YYYY-MM-DD)
 *   joinTo      (ISO date YYYY-MM-DD)
 *   zones       (comma-separated zone names)
 *
 * Falls back to mock data when Supabase env vars are absent.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { mockMembers } from '@/lib/site';
import type { AgeGroup } from '@/lib/site';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const page       = Math.max(1, parseInt(searchParams.get('page')     ?? '1', 10));
  const pageSize   = Math.min(48, Math.max(1, parseInt(searchParams.get('pageSize') ?? '12', 10)));
  const status     = searchParams.get('status')     ?? 'all';
  const q          = searchParams.get('q')?.trim().toLowerCase()  ?? '';
  const ministries = searchParams.get('ministries') ?? '';
  const ageGroups  = searchParams.get('ageGroups')  ?? '';
  const joinFrom   = searchParams.get('joinFrom')   ?? '';
  const joinTo     = searchParams.get('joinTo')     ?? '';
  const zones      = searchParams.get('zones')      ?? '';

  const ministryList  = ministries ? ministries.split(',').map((s) => s.trim()) : [];
  const ageGroupList  = ageGroups  ? (ageGroups.split(',').map((s) => s.trim()) as AgeGroup[]) : [];
  const zoneList      = zones      ? zones.split(',').map((s) => s.trim()) : [];

  const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // ── Mock data fallback ────────────────────────────────────────────────────
  if (!supabaseUrl || !supabaseAnonKey) {
    let results = mockMembers;

    if (status !== 'all')        results = results.filter((m) => m.status === status);
    if (q)                       results = results.filter((m) =>
      m.fullName.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.ministries.some((t) => t.toLowerCase().includes(q)),
    );
    if (ministryList.length)     results = results.filter((m) =>
      ministryList.some((min) => m.ministries.includes(min)),
    );
    if (ageGroupList.length)     results = results.filter((m) =>
      m.ageGroup && ageGroupList.includes(m.ageGroup),
    );
    if (joinFrom)                results = results.filter((m) => m.joinedDate >= joinFrom);
    if (joinTo)                  results = results.filter((m) => m.joinedDate <= joinTo);
    if (zoneList.length)         results = results.filter((m) =>
      m.zone && zoneList.includes(m.zone),
    );

    const total = results.length;
    const from  = (page - 1) * pageSize;
    return NextResponse.json({ data: results.slice(from, from + pageSize), total, page, pageSize });
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
    let dbQuery = supabase
      .from('members')
      .select('*', { count: 'exact' })
      .is('deleted_at', null)
      .order('full_name', { ascending: true })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (status !== 'all')       dbQuery = dbQuery.eq('status', status);
    if (q)                      dbQuery = dbQuery.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);
    if (ministryList.length)    dbQuery = dbQuery.overlaps('ministries', ministryList);
    if (ageGroupList.length)    dbQuery = dbQuery.in('age_group', ageGroupList);
    if (joinFrom)               dbQuery = dbQuery.gte('joined_date', joinFrom);
    if (joinTo)                 dbQuery = dbQuery.lte('joined_date', joinTo);
    if (zoneList.length)        dbQuery = dbQuery.in('zone', zoneList);

    const { data, count, error } = await dbQuery;
    if (error) throw error;

    const members = (data ?? []).map((row) => ({
      id:         row.id,
      fullName:   row.full_name,
      email:      row.email,
      phone:      row.phone       ?? undefined,
      photoUrl:   row.photo_url   ?? undefined,
      status:     row.status,
      role:       row.role,
      ministries: row.ministries  ?? [],
      joinedDate: row.joined_date,
      ageGroup:   row.age_group   ?? undefined,
      zone:       row.zone        ?? undefined,
    }));

    return NextResponse.json({ data: members, total: count ?? 0, page, pageSize });
  } catch (err) {
    console.error('[api/members] error:', err);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}
