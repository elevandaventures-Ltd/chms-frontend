import { NextResponse, type NextRequest } from 'next/server';
import { listMessageReports } from '@/lib/communication-store';

export async function GET(request: NextRequest) {
  try {
    const { createSupabaseServerClient } = await import('@/lib/supabase/server');
    const response = NextResponse.next();
    const supabase = createSupabaseServerClient(request, response);

    const { data, error } = await supabase
      .from('message_reports')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(50);

    if (error || !data || data.length === 0) throw error ?? new Error('no rows');

    // Normalise snake_case → camelCase
    const reports = data.map((r: Record<string, unknown>) => ({
      id:         r.id,
      channel:    r.channel,
      subject:    r.subject,
      recipients: r.recipients,
      delivered:  r.delivered,
      failed:     r.failed ?? 0,
      opened:     r.opened,
      sentAt:     r.sent_at,
      status:     r.status,
    }));

    return NextResponse.json({ data: reports });
  } catch {
    // Supabase absent (or the message_reports table doesn't exist yet) —
    // fall back to the in-memory store, which every send/schedule route
    // also writes to, so newly sent messages still show up here.
    return NextResponse.json({ data: listMessageReports() });
  }
}
