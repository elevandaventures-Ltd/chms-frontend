import { NextResponse, type NextRequest } from 'next/server';
import { mockMembers } from '@/lib/site';
import type { AgeGroup, MemberStatus } from '@/lib/site';

type Body = {
  statuses:   MemberStatus[];
  ministries: string[];
  ageGroups:  AgeGroup[];
  zones:      string[];
  channel:    string;
};

export async function POST(request: NextRequest) {
  const body = await request.json() as Body;
  const { statuses, ministries, ageGroups, zones, channel } = body;

  // Try Supabase first; fall back to mock data.
  let members = mockMembers;

  try {
    const { createSupabaseServerClient } = await import('@/lib/supabase/server');
    const response = NextResponse.next();
    const supabase = createSupabaseServerClient(request, response);
    const { data } = await supabase.from('members').select('id,full_name,status,ministries,age_group,zone,phone,email');
    if (data && data.length > 0) members = data as unknown as typeof mockMembers;
  } catch { /* env vars absent — use mock */ }

  let filtered = members;

  if (statuses.length)   filtered = filtered.filter((m) => statuses.includes(m.status));
  if (ministries.length) filtered = filtered.filter((m) => m.ministries.some((min) => ministries.includes(min)));
  if (ageGroups.length)  filtered = filtered.filter((m) => m.ageGroup && ageGroups.includes(m.ageGroup));
  if (zones.length)      filtered = filtered.filter((m) => m.zone && zones.includes(m.zone));

  // Further filter by channel reachability.
  if (channel === 'sms' || channel === 'whatsapp') {
    filtered = filtered.filter((m) => Boolean(m.phone));
  } else if (channel === 'email') {
    filtered = filtered.filter((m) => Boolean(m.email));
  }

  // Per-segment breakdown for the send-confirmation dialog (Day 35).
  const byStatus: Record<string, number> = {};
  filtered.forEach((m) => { byStatus[m.status] = (byStatus[m.status] ?? 0) + 1; });

  // A short name sample for the WhatsApp composer's recipient list (Day 36).
  const sampleNames = filtered
    .slice(0, 8)
    .map((m) => (m as { fullName?: string; full_name?: string }).fullName ?? (m as { full_name?: string }).full_name ?? 'Member')
    .filter(Boolean);

  return NextResponse.json({ reach: filtered.length, breakdown: { byStatus }, sampleNames });
}
