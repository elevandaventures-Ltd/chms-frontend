import { timeoutFetch, disablePostgrestRetry } from '@/lib/supabase/timeout-fetch';
/**
 * GET  /api/members — paginated, filtered member list.
 * POST /api/members — create a new member (multipart/form-data).
 *
 * Falls back to mock data / mock insert when Supabase env vars are absent.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { mockMembers } from '@/lib/site';
import type { AgeGroup, Member } from '@/lib/site';
import { memberSchema } from '@/lib/member-schema';

const STRESS_FIRST_NAMES = ['Abena', 'Kwame', 'Ama', 'Kofi', 'Efua', 'Yaw', 'Akosua', 'Nana', 'Kwabena', 'Adwoa', 'Ekow', 'Maame', 'Fiifi', 'Esi', 'Kweku'];
const STRESS_LAST_NAMES = ['Mensah', 'Asante', 'Boateng', 'Owusu', 'Darko', 'Appiah', 'Frimpong', 'Tetteh', 'Adjei', 'Osei'];

/** Day 57 load-testing aid: deterministically generate N synthetic
 *  members so virtualized-scroll performance can actually be exercised
 *  against a 5,000-row dataset without a real Supabase project that big. */
function generateStressMembers(count: number): Member[] {
  const list: Member[] = [];
  for (let i = 0; i < count; i++) {
    const first = STRESS_FIRST_NAMES[i % STRESS_FIRST_NAMES.length];
    const last = STRESS_LAST_NAMES[Math.floor(i / STRESS_FIRST_NAMES.length) % STRESS_LAST_NAMES.length];
    list.push({
      id: `stress-${i}`,
      fullName: `${first} ${last} ${i}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@elevanda.org`,
      status: (['active', 'inactive', 'visitor'] as const)[i % 3],
      role: 'member',
      ministries: [],
      joinedDate: '2022-01-01',
    });
  }
  return list;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const page       = Math.max(1, parseInt(searchParams.get('page')     ?? '1', 10));
  // Capped at 48 for the paginated card grid; the virtualized list view
  // (Day 57) requests a much larger batch since react-virtual — not
  // pagination — is what keeps that view's DOM light.
  const pageSize   = Math.min(10000, Math.max(1, parseInt(searchParams.get('pageSize') ?? '12', 10)));
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

  // Day 57 load-testing aid: an explicit `stress` param always wins, even
  // when Supabase is configured — otherwise this dev-only escape hatch
  // would silently do nothing whenever a real (if empty) project is
  // connected, which is exactly the environment it's most useful in.
  const stressCount = Math.min(20000, Math.max(0, parseInt(searchParams.get('stress') ?? '0', 10)));
  if (stressCount > 0) {
    let results = generateStressMembers(stressCount);
    if (status !== 'all') results = results.filter((m) => m.status === status);
    if (q) results = results.filter((m) => m.fullName.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));
    const total = results.length;
    const from  = (page - 1) * pageSize;
    return NextResponse.json({ data: results.slice(from, from + pageSize), total, page, pageSize });
  }

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
    global: { fetch: timeoutFetch },
  });
  disablePostgrestRetry(supabase);

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

    // RLS returns 0 rows for unauthenticated requests — fall back to mock
    if (!data || data.length === 0) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('unauthenticated — use mock');
    }

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
    console.error('[api/members GET] falling back to mock:', err);
    // Supabase configured but tables missing — fall back to mock
    let results = mockMembers;
    if (status !== 'all')    results = results.filter((m) => m.status === status);
    if (q)                   results = results.filter((m) => m.fullName.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));
    if (ministryList.length) results = results.filter((m) => ministryList.some((min) => m.ministries.includes(min)));
    if (ageGroupList.length) results = results.filter((m) => m.ageGroup && ageGroupList.includes(m.ageGroup));
    if (joinFrom)            results = results.filter((m) => m.joinedDate >= joinFrom);
    if (joinTo)              results = results.filter((m) => m.joinedDate <= joinTo);
    if (zoneList.length)     results = results.filter((m) => m.zone && zoneList.includes(m.zone));
    const total = results.length;
    const from  = (page - 1) * pageSize;
    return NextResponse.json({ data: results.slice(from, from + pageSize), total, page, pageSize, source: 'mock' });
  }
}

// ── POST /api/members ─────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const raw      = formData.get('data');
    if (!raw || typeof raw !== 'string') {
      return NextResponse.json({ error: 'Missing form data.' }, { status: 400 });
    }

    const parsed = memberSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed.', issues: parsed.error.flatten().fieldErrors },
        { status: 422 },
      );
    }

    const data = parsed.data;
    const fullName = `${data.firstName} ${data.lastName}`;

    const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // ── Mock fallback ─────────────────────────────────────────────────────
    if (!supabaseUrl || !supabaseAnonKey) {
      const mockId = `m${Date.now()}`;
      const phone = data.phone?.trim();
      if (phone) await sendWelcomeSms(phone, data.firstName);
      return NextResponse.json({ id: mockId, fullName }, { status: 201 });
    }

    // ── Supabase insert ───────────────────────────────────────────────────
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

    // Handle photo upload to Supabase Storage
    let photoUrl: string | undefined;
    const photo = formData.get('photo');
    if (photo instanceof Blob) {
      const ext      = photo.type.split('/')[1] ?? 'jpg';
      const fileName = `members/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(fileName, photo, { contentType: photo.type, upsert: false });
      if (!uploadErr) {
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
        photoUrl = urlData.publicUrl;
      }
    }

    const { data: row, error } = await supabase
      .from('members')
      .insert({
        full_name:   fullName,
        email:       data.email,
        phone:       data.phone       || null,
        photo_url:   photoUrl         || null,
        status:      data.status,
        role:        data.role,
        ministries:  data.ministries  ?? [],
        joined_date: data.joinedDate,
        age_group:   data.ageGroup    || null,
        zone:        data.zone        || null,
        notes:       data.notes       || null,
        denomination: data.denomination || null,
        baptised:    data.baptised    ?? false,
        address:     data.address     || null,
        city:        data.city        || null,
        country:     data.country     || null,
        date_of_birth: data.dateOfBirth || null,
        gender:      data.gender      || null,
        household_head_id: data.householdHeadId || null,
        household_role:    data.householdRole    || null,
      })
      .select('id')
      .single();

    if (error) throw error;

    // ── Welcome SMS ───────────────────────────────────────────────────────
    const phone = data.phone?.trim();
    if (phone) await sendWelcomeSms(phone, data.firstName);

    return NextResponse.json({ id: row.id, fullName }, { status: 201 });

  } catch (err) {
    console.error('[api/members POST] error:', err);
    return NextResponse.json({ error: 'Failed to create member.' }, { status: 500 });
  }
}

// ── Twilio welcome SMS ────────────────────────────────────────────────────────

async function sendWelcomeSms(to: string, firstName: string): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const from       = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !from) return; // silently skip when not configured

  const body = `Hi ${firstName}! Welcome to the church family. We're glad to have you with us. 🙏`;

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    console.warn('[api/members] Twilio SMS failed:', text);
  }
}
