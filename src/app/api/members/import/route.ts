/**
 * POST /api/members/import — bulk import members from a mapped CSV.
 *
 * Body (JSON):
 *   { members: NormalizedMember[], dryRun?: boolean }
 *
 * Members are matched to existing records by email (case-insensitive):
 *   - existing  → counted as an update (and updated on commit)
 *   - new       → counted as an add    (and inserted on commit)
 *   - invalid   → skipped
 *
 * With dryRun=true only the estimate is returned; nothing is written.
 * Falls back to mock-data estimates when Supabase env vars are absent.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { mockMembers } from '@/lib/site';
import { z } from 'zod';

const memberSchema = z.object({
  fullName:     z.string(),
  email:        z.string(),
  phone:        z.string().optional().default(''),
  status:       z.enum(['active', 'inactive', 'visitor']),
  role:         z.enum(['admin', 'pastor', 'finance', 'ministry_leader', 'staff', 'member']),
  joinedDate:   z.string(),
  ageGroup:     z.string().optional().default(''),
  zone:         z.string().optional().default(''),
  ministries:   z.array(z.string()).optional().default([]),
  gender:       z.string().optional().default(''),
  denomination: z.string().optional().default(''),
  notes:        z.string().optional().default(''),
  valid:        z.boolean(),
});

const bodySchema = z.object({
  members: z.array(memberSchema).min(1, 'No rows to import.').max(5000),
  dryRun:  z.boolean().optional().default(false),
});

type ImportMember = z.infer<typeof memberSchema>;

function toRow(m: ImportMember) {
  return {
    full_name:    m.fullName,
    email:        m.email,
    phone:        m.phone || null,
    status:       m.status,
    role:         m.role,
    ministries:   m.ministries,
    joined_date:  m.joinedDate,
    age_group:    m.ageGroup || null,
    zone:         m.zone || null,
    gender:       m.gender || null,
    denomination: m.denomination || null,
    notes:        m.notes || null,
  };
}

export async function POST(request: NextRequest) {
  try {
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed.', issues: parsed.error.flatten().fieldErrors },
        { status: 422 },
      );
    }
    const { members, dryRun } = parsed.data;

    const valid   = members.filter((m) => m.valid);
    const skipped = members.length - valid.length;

    const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Build the set of emails that already exist (for the add/update split).
    let existing: Set<string>;

    // ── Mock fallback ──────────────────────────────────────────────────────
    if (!supabaseUrl || !supabaseAnonKey) {
      existing = new Set(mockMembers.map((m) => m.email.toLowerCase()));
      const willUpdate = valid.filter((m) => existing.has(m.email.toLowerCase())).length;
      const willAdd    = valid.length - willUpdate;
      return NextResponse.json({
        dryRun, persisted: false, source: 'mock',
        added: willAdd, updated: willUpdate, skipped,
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
    });

    const emails = Array.from(new Set(valid.map((m) => m.email.toLowerCase())));
    const { data: rows, error: lookupErr } = await supabase
      .from('members')
      .select('email')
      .in('email', emails)
      .is('deleted_at', null);
    if (lookupErr) throw lookupErr;

    existing = new Set((rows ?? []).map((r) => (r.email as string).toLowerCase()));

    const toUpdate = valid.filter((m) => existing.has(m.email.toLowerCase()));
    const toAdd    = valid.filter((m) => !existing.has(m.email.toLowerCase()));

    // Dry run — report the estimate without writing.
    if (dryRun) {
      return NextResponse.json({
        dryRun: true, persisted: false, source: 'supabase',
        added: toAdd.length, updated: toUpdate.length, skipped,
      });
    }

    // ── Commit ─────────────────────────────────────────────────────────────
    let added = 0;
    let updated = 0;

    if (toAdd.length > 0) {
      const { error } = await supabase.from('members').insert(toAdd.map(toRow));
      if (error) throw error;
      added = toAdd.length;
    }

    for (const m of toUpdate) {
      const { error } = await supabase
        .from('members')
        .update(toRow(m))
        .eq('email', m.email)
        .is('deleted_at', null);
      if (!error) updated += 1;
    }

    return NextResponse.json({
      dryRun: false, persisted: true, source: 'supabase',
      added, updated, skipped,
    });
  } catch (err) {
    console.error('[api/members/import POST] error:', err);
    return NextResponse.json({ error: 'Failed to import members.' }, { status: 500 });
  }
}
