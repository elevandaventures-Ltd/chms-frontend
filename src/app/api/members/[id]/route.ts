/**
 * GET /api/members/:id — full member record mapped to Edit-form field names.
 * PUT /api/members/:id — update an existing member (multipart/form-data).
 *
 * Falls back to mock data when Supabase env vars are absent — mirrors the
 * behaviour of the collection route at /api/members.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { mockMembers } from '@/lib/site';
import { memberSchema } from '@/lib/member-schema';

type RouteCtx = { params: Promise<{ id: string }> };

// Split a stored "full_name" into the first/last fields the form expects.
function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts.shift() ?? '';
  return { firstName, lastName: parts.join(' ') };
}

function supabaseFromRequest(request: NextRequest, response: NextResponse) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  return createServerClient(url, key, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookies: { name: string; value: string; options?: CookieOptions }[]) {
        cookies.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options ?? {}),
        );
      },
    },
  });
}

// ── GET ─────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest, ctx: RouteCtx) {
  const { id } = await ctx.params;
  const response = NextResponse.next();
  const supabase = supabaseFromRequest(request, response);

  // ── Mock fallback ──────────────────────────────────────────────────────
  if (!supabase) {
    const m = mockMembers.find((row) => row.id === id);
    if (!m) return NextResponse.json({ error: 'Member not found.' }, { status: 404 });
    const { firstName, lastName } = splitName(m.fullName);
    return NextResponse.json({
      data: {
        firstName, lastName,
        email:      m.email,
        phone:      m.phone ?? '',
        status:     m.status,
        role:       m.role,
        joinedDate: m.joinedDate,
        ministries: m.ministries ?? [],
        ageGroup:   m.ageGroup ?? '',
        zone:       m.zone ?? '',
        notes:      m.notes ?? '',
        photoUrl:   m.photoUrl ?? null,
      },
    });
  }

  try {
    const { data: row, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !row) {
      // Fall back to mock if table missing
      const m = mockMembers.find((row) => row.id === id);
      if (!m) return NextResponse.json({ error: 'Member not found.' }, { status: 404 });
      const { firstName, lastName } = splitName(m.fullName);
      return NextResponse.json({ data: { firstName, lastName, email: m.email, phone: m.phone ?? '', status: m.status, role: m.role, joinedDate: m.joinedDate, ministries: m.ministries ?? [], ageGroup: m.ageGroup ?? '', zone: m.zone ?? '', notes: m.notes ?? '', photoUrl: m.photoUrl ?? null } });
    }

    const { firstName, lastName } = splitName(row.full_name ?? '');

    return NextResponse.json({
      data: {
        firstName, lastName,
        email:           row.email ?? '',
        phone:           row.phone ?? '',
        dateOfBirth:     row.date_of_birth ?? '',
        gender:          row.gender ?? '',
        ageGroup:        row.age_group ?? '',
        status:          row.status,
        role:            row.role,
        joinedDate:      row.joined_date,
        zone:            row.zone ?? '',
        denomination:    row.denomination ?? '',
        baptised:        row.baptised ?? false,
        address:         row.address ?? '',
        city:            row.city ?? '',
        country:         row.country ?? '',
        householdHeadId: row.household_head_id ?? '',
        householdRole:   row.household_role ?? '',
        ministries:      row.ministries ?? [],
        notes:           row.notes ?? '',
        photoUrl:        row.photo_url ?? null,
      },
    });
  } catch (err) {
    console.error('[api/members/:id GET] error:', err);
    return NextResponse.json({ error: 'Failed to fetch member.' }, { status: 500 });
  }
}

// ── PUT ─────────────────────────────────────────────────────────────────────

export async function PUT(request: NextRequest, ctx: RouteCtx) {
  const { id } = await ctx.params;

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

    const data     = parsed.data;
    const fullName = `${data.firstName} ${data.lastName}`;
    const removePhoto = formData.get('removePhoto') === '1';

    const response = NextResponse.next();
    const supabase = supabaseFromRequest(request, response);

    // ── Mock fallback ──────────────────────────────────────────────────────
    if (!supabase) {
      return NextResponse.json({ id, fullName });
    }

    // Photo: upload a replacement, clear it, or leave the existing value alone.
    let photoUrl: string | null | undefined;
    const photo = formData.get('photo');
    if (photo instanceof Blob) {
      const ext      = photo.type.split('/')[1] ?? 'jpg';
      const fileName = `members/${id}-${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(fileName, photo, { contentType: photo.type, upsert: false });
      if (!uploadErr) {
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
        photoUrl = urlData.publicUrl;
      }
    } else if (removePhoto) {
      photoUrl = null;
    }

    const update: Record<string, unknown> = {
      full_name:         fullName,
      email:             data.email,
      phone:             data.phone       || null,
      status:            data.status,
      role:              data.role,
      ministries:        data.ministries  ?? [],
      joined_date:       data.joinedDate,
      age_group:         data.ageGroup    || null,
      zone:              data.zone        || null,
      notes:             data.notes       || null,
      denomination:      data.denomination || null,
      baptised:          data.baptised    ?? false,
      address:           data.address     || null,
      city:              data.city        || null,
      country:           data.country     || null,
      date_of_birth:     data.dateOfBirth || null,
      gender:            data.gender      || null,
      household_head_id: data.householdHeadId || null,
      household_role:    data.householdRole    || null,
    };
    if (photoUrl !== undefined) update.photo_url = photoUrl;

    const { data: row, error } = await supabase
      .from('members')
      .update(update)
      .eq('id', id)
      .is('deleted_at', null)
      .select('id')
      .single();

    if (error || !row) {
      return NextResponse.json({ error: 'Failed to update member.' }, { status: 500 });
    }

    return NextResponse.json({ id: row.id, fullName });
  } catch (err) {
    console.error('[api/members/:id PUT] error:', err);
    return NextResponse.json({ error: 'Failed to update member.' }, { status: 500 });
  }
}
