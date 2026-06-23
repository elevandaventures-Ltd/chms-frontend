/**
 * Aging-alert job — scans members and raises alerts for "stale" statuses.
 *
 *   GET  /api/jobs/aging-alerts  — dry run: list the members that would alert.
 *   POST /api/jobs/aging-alerts  — run the job and populate member_alerts.
 *
 * Designed to be triggered on a schedule (Vercel Cron, GitHub Action, or
 * pg_cron calling run_aging_alerts() directly). Falls back to an in-memory
 * computation over mock data when Supabase env vars are absent.
 *
 * Rules (mirror the SQL run_aging_alerts function):
 *   • aging_visitor  — still a visitor  > VISITOR_DAYS  after joining
 *   • dormant_member — marked inactive  > INACTIVE_DAYS after joining
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { mockMembers } from '@/lib/site';

const VISITOR_DAYS  = 30;
const INACTIVE_DAYS = 90;

type AlertType = 'aging_visitor' | 'dormant_member';
type Candidate = { memberId: string; fullName: string; type: AlertType; message: string };

// Days between an ISO date string and "now" (server time).
function daysSince(isoDate: string, now: number): number {
  const t = Date.parse(isoDate);
  if (Number.isNaN(t)) return 0;
  return Math.floor((now - t) / 86_400_000);
}

function computeMockCandidates(): Candidate[] {
  const now = Date.now();
  const out: Candidate[] = [];
  for (const m of mockMembers) {
    if (m.status === 'visitor' && daysSince(m.joinedDate, now) >= VISITOR_DAYS) {
      out.push({
        memberId: m.id, fullName: m.fullName, type: 'aging_visitor',
        message: `Visitor for over ${VISITOR_DAYS} days — consider follow-up or membership.`,
      });
    }
    if (m.status === 'inactive' && daysSince(m.joinedDate, now) >= INACTIVE_DAYS) {
      out.push({
        memberId: m.id, fullName: m.fullName, type: 'dormant_member',
        message: 'Member inactive for some time — schedule a re-engagement visit.',
      });
    }
  }
  return out;
}

function getSupabase(request: NextRequest, response: NextResponse) {
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

// Optional shared-secret guard for scheduled callers.
function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // not configured → allow (dev / mock)
  const header = request.headers.get('authorization');
  return header === `Bearer ${secret}`;
}

// ── GET — dry run ─────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const response  = NextResponse.next();
  const supabase  = getSupabase(request, response);

  if (!supabase) {
    const candidates = computeMockCandidates();
    return NextResponse.json({ mode: 'dry-run', source: 'mock', candidates, count: candidates.length });
  }

  // Against a real DB, report the currently OPEN alerts.
  const { data, error } = await supabase
    .from('member_alerts')
    .select('member_id, type, severity, message, status, created_at')
    .eq('status', 'open')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[jobs/aging-alerts GET] error:', error);
    return NextResponse.json({ error: 'Failed to read alerts.' }, { status: 500 });
  }
  return NextResponse.json({ mode: 'open-alerts', source: 'supabase', alerts: data ?? [], count: data?.length ?? 0 });
}

// ── POST — run the job ────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const response = NextResponse.next();
  const supabase = getSupabase(request, response);

  // ── Mock fallback — compute but don't persist ──────────────────────────────
  if (!supabase) {
    const candidates = computeMockCandidates();
    return NextResponse.json({
      ran: true, source: 'mock', persisted: false,
      created: candidates.length, candidates,
      note: 'Supabase not configured — alerts computed but not stored.',
    });
  }

  // Idempotent server-side run via the SQL function.
  const { data, error } = await supabase.rpc('run_aging_alerts', {
    p_visitor_days:  VISITOR_DAYS,
    p_inactive_days: INACTIVE_DAYS,
  });

  if (error) {
    console.error('[jobs/aging-alerts POST] error:', error);
    return NextResponse.json({ error: 'Failed to run aging alerts.' }, { status: 500 });
  }

  return NextResponse.json({ ran: true, source: 'supabase', persisted: true, created: data ?? 0 });
}
