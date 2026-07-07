import { NextResponse, type NextRequest } from 'next/server';

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

    if (error) throw error;

    // Normalise snake_case → camelCase
    const reports = (data ?? []).map((r: Record<string, unknown>) => ({
      id:         r.id,
      channel:    r.channel,
      subject:    r.subject,
      recipients: r.recipients,
      delivered:  r.delivered,
      opened:     r.opened,
      sentAt:     r.sent_at,
      status:     r.status,
    }));

    return NextResponse.json({ data: reports });
  } catch {
    // Supabase absent — return empty so the component falls back to mock data
    return NextResponse.json({ data: [] });
  }
}
