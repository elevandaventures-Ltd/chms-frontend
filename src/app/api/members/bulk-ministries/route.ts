/**
 * POST /api/members/bulk-ministries — assign ministries to many members at once.
 *
 * Body (JSON):
 *   { ids: string[], ministries: string[], mode: 'add' | 'replace' }
 *
 * 'add'     — union the given ministries into each member's existing teams.
 * 'replace' — overwrite each member's ministries with the given list.
 *
 * Falls back to a no-op success when Supabase env vars are absent.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { z } from 'zod';

const bodySchema = z.object({
  ids:        z.array(z.string().min(1)).min(1, 'No members selected.'),
  ministries: z.array(z.string().min(1)).min(1, 'No ministries selected.'),
  mode:       z.enum(['add', 'replace']),
});

export async function POST(request: NextRequest) {
  try {
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed.', issues: parsed.error.flatten().fieldErrors },
        { status: 422 },
      );
    }
    const { ids, ministries, mode } = parsed.data;

    const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // ── Mock fallback ──────────────────────────────────────────────────────
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ updated: ids.length, mode });
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

    if (mode === 'replace') {
      const { error } = await supabase
        .from('members')
        .update({ ministries })
        .in('id', ids)
        .is('deleted_at', null);
      if (error) throw error;
      return NextResponse.json({ updated: ids.length, mode });
    }

    // 'add' — union per member (each may have a different existing set).
    const { data: rows, error: fetchErr } = await supabase
      .from('members')
      .select('id, ministries')
      .in('id', ids)
      .is('deleted_at', null);
    if (fetchErr) throw fetchErr;

    let updated = 0;
    for (const row of rows ?? []) {
      const merged = Array.from(new Set([...(row.ministries ?? []), ...ministries]));
      const { error } = await supabase
        .from('members')
        .update({ ministries: merged })
        .eq('id', row.id);
      if (!error) updated += 1;
    }

    return NextResponse.json({ updated, mode });
  } catch (err) {
    console.error('[api/members/bulk-ministries POST] error:', err);
    return NextResponse.json({ error: 'Failed to assign ministries.' }, { status: 500 });
  }
}
