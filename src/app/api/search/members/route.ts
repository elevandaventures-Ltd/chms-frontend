/**
 * GET /api/search/members
 *
 * Instant fuzzy member search — Day 13.
 *
 * Query params:
 *   q        (required — search string)
 *   limit    (default 20, max 50)
 *   status   ('active' | 'inactive' | 'visitor' | 'all')
 *
 * Response:
 *   200 {
 *     hits: SearchHit[],     // members with _formatted highlight fields
 *     total: number,
 *     processingTimeMs: number,
 *   }
 *
 * Priority order:
 *   1. Meilisearch (when MEILISEARCH_HOST + MEILISEARCH_KEY are set)
 *   2. Supabase ilike (when Supabase env vars are set)
 *   3. Mock data fuzzy search (always available — dev fallback)
 *
 * The _formatted fields from Meilisearch contain <em> tags wrapping
 * matched terms; the client renders them via dangerouslySetInnerHTML
 * only on safe fields (fullName, email, ministries).
 */
import { NextResponse, type NextRequest } from 'next/server';
import { getMeilisearchClient, MEMBERS_INDEX } from '@/lib/meilisearch';
import { mockMembers } from '@/lib/site';
import type { Member } from '@/lib/site';

export type SearchHit = Member & {
  /** Meilisearch highlight: matched terms wrapped in <em>…</em> */
  _formatted?: {
    fullName?: string;
    email?: string;
    ministries?: string[];
  };
  /** Score from 0–1; absent in fallback mode */
  _rankingScore?: number;
};

type SearchResponse = {
  hits: SearchHit[];
  total: number;
  processingTimeMs: number;
};

// ── Fuzzy match helpers for mock/fallback ─────────────────────────────────────

/** Returns true if `text` contains every char of `query` in order (fuzzy). */
function fuzzyMatch(text: string, query: string): boolean {
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  let ti = 0;
  for (let qi = 0; qi < q.length; qi++) {
    const found = t.indexOf(q[qi], ti);
    if (found === -1) return false;
    ti = found + 1;
  }
  return true;
}

/**
 * Wrap all occurrences of `query` in `text` with <em> tags.
 * Case-insensitive, handles partial matches.
 */
function highlight(text: string, query: string): string {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<em>$1</em>');
}

function buildFormatted(member: Member, q: string) {
  return {
    fullName:    highlight(member.fullName, q),
    email:       highlight(member.email, q),
    ministries:  member.ministries.map((m) => highlight(m, q)),
  };
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const q      = searchParams.get('q')?.trim() ?? '';
  const limit  = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));
  const status = searchParams.get('status') ?? 'all';

  if (!q) {
    return NextResponse.json({ hits: [], total: 0, processingTimeMs: 0 });
  }

  const t0 = Date.now();

  // ── 1. Try Meilisearch ────────────────────────────────────────────────────
  const ms = getMeilisearchClient();

  if (ms) {
    try {
      const filter = status !== 'all' ? [`status = ${status}`] : undefined;

      const result = await ms.index(MEMBERS_INDEX).search<Member>(q, {
        limit,
        filter,
        attributesToHighlight: ['fullName', 'email', 'ministries'],
        highlightPreTag:  '<em>',
        highlightPostTag: '</em>',
        attributesToSearchOn: ['fullName', 'email', 'ministries', 'phone'],
        // Meilisearch typo tolerance handles fuzzy matching natively
      });

      const hits: SearchHit[] = (result.hits ?? []).map((hit) => ({
        ...hit,
        _formatted: (hit as SearchHit & { _formatted?: Record<string, unknown> })._formatted as SearchHit['_formatted'],
      }));

      return NextResponse.json({
        hits,
        total: result.estimatedTotalHits ?? hits.length,
        processingTimeMs: result.processingTimeMs ?? (Date.now() - t0),
      } satisfies SearchResponse);
    } catch (err) {
      console.error('[api/search/members] Meilisearch error — falling back:', err);
      // Fall through to next strategy
    }
  }

  // ── 2. Supabase ilike fallback ────────────────────────────────────────────
  const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const { createServerClient } = await import('@supabase/ssr');
      type CookieOptions = import('@supabase/ssr').CookieOptions;

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

      let dbQuery = supabase
        .from('members')
        .select('*')
        .or(`full_name.ilike.%${q}%,email.ilike.%${q}%`)
        .limit(limit);

      if (status !== 'all') dbQuery = dbQuery.eq('status', status);

      const { data, error } = await dbQuery;
      if (error) throw error;

      const hits: SearchHit[] = (data ?? []).map((row) => {
        const member: Member = {
          id: row.id, fullName: row.full_name, email: row.email,
          phone: row.phone ?? undefined, photoUrl: row.photo_url ?? undefined,
          status: row.status, role: row.role,
          ministries: row.ministries ?? [], joinedDate: row.joined_date,
        };
        return { ...member, _formatted: buildFormatted(member, q) };
      });

      return NextResponse.json({
        hits,
        total: hits.length,
        processingTimeMs: Date.now() - t0,
      } satisfies SearchResponse);
    } catch (err) {
      console.error('[api/search/members] Supabase fallback error:', err);
    }
  }

  // ── 3. Mock data fuzzy fallback ───────────────────────────────────────────
  const ql = q.toLowerCase();
  let results = mockMembers.filter(
    (m) =>
      (status === 'all' || m.status === status) &&
      (fuzzyMatch(m.fullName, ql) ||
       fuzzyMatch(m.email, ql) ||
       m.ministries.some((t) => fuzzyMatch(t, ql))),
  );

  // Sort by how early the match appears in fullName
  results = results.sort((a, b) => {
    const ai = a.fullName.toLowerCase().indexOf(ql);
    const bi = b.fullName.toLowerCase().indexOf(ql);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return 0;
  });

  const hits: SearchHit[] = results.slice(0, limit).map((m) => ({
    ...m,
    _formatted: buildFormatted(m, q),
  }));

  return NextResponse.json({
    hits,
    total: hits.length,
    processingTimeMs: Date.now() - t0,
  } satisfies SearchResponse);
}
