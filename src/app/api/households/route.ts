/**
 * GET /api/households — households with their members and relationships.
 *
 * When the `households` table has rows, members are grouped by household_id and
 * the relation comes from household_role / is_head_of_household. Otherwise the
 * households are synthesised from the member list. Falls back to mock members
 * when Supabase env vars are absent.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { timeoutFetch, disablePostgrestRetry } from '@/lib/supabase/timeout-fetch';
import { mockMembers } from '@/lib/site';
import type { Member } from '@/lib/site';
import {
  synthesizeHouseholds,
  type Household,
  type HouseholdMember,
  type HouseholdRelation,
} from '@/lib/households';

function rowToMember(row: Record<string, unknown>): Member {
  return {
    id:         String(row.id),
    fullName:   String(row.full_name ?? ''),
    email:      String(row.email ?? ''),
    phone:      (row.phone as string) ?? undefined,
    photoUrl:   (row.photo_url as string) ?? undefined,
    status:     (row.status as Member['status']) ?? 'active',
    role:       (row.role as Member['role']) ?? 'member',
    ministries: (row.ministries as string[]) ?? [],
    joinedDate: String(row.joined_date ?? ''),
    ageGroup:   (row.age_group as Member['ageGroup']) ?? undefined,
    zone:       (row.zone as string) ?? undefined,
  };
}

export async function GET(request: NextRequest) {
  const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // ── Mock fallback ──────────────────────────────────────────────────────
  if (!supabaseUrl || !supabaseAnonKey) {
    const households = synthesizeHouseholds(mockMembers);
    return NextResponse.json({ data: households, source: 'mock' });
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

  try {
    const [{ data: households }, { data: members }] = await Promise.all([
      supabase.from('households').select('*'),
      supabase.from('members').select('*').is('deleted_at', null),
    ]);

    const memberRows = (members ?? []).map(rowToMember);

    // RLS returns 0 rows for unauthenticated requests — fall back to mock
    if (!members || members.length === 0) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return NextResponse.json({ data: synthesizeHouseholds(mockMembers), source: 'mock' });
    }

    // No real households yet → synthesise from members.
    if (!households || households.length === 0) {
      return NextResponse.json({ data: synthesizeHouseholds(memberRows), source: 'synthesized' });
    }

    // Group members by their household_id.
    const byHousehold = new Map<string, Record<string, unknown>[]>();
    for (const row of members ?? []) {
      const hid = row.household_id as string | null;
      if (!hid) continue;
      if (!byHousehold.has(hid)) byHousehold.set(hid, []);
      byHousehold.get(hid)!.push(row);
    }

    const result: Household[] = households.map((h: Record<string, unknown>) => {
      const rows = byHousehold.get(String(h.id)) ?? [];
      const members: HouseholdMember[] = rows.map((row): HouseholdMember => {
        const m = rowToMember(row);
        const relation: HouseholdRelation = row.is_head_of_household
          ? 'head'
          : ((row.household_role as HouseholdRelation) ?? 'other');
        return { ...m, relation };
      });
      // Heads first, then by name.
      members.sort((a, b) =>
        (a.relation === 'head' ? -1 : 0) - (b.relation === 'head' ? -1 : 0) ||
        a.fullName.localeCompare(b.fullName),
      );
      return {
        id: String(h.id),
        name: String(h.name ?? 'Household'),
        zone: (h.zone as string) ?? undefined,
        memberCount: members.length,
        members,
      };
    });

    return NextResponse.json({ data: result, source: 'supabase' });
  } catch (err) {
    console.error('[api/households GET] falling back to mock:', err);
    return NextResponse.json({ data: synthesizeHouseholds(mockMembers), source: 'mock' });
  }
}
