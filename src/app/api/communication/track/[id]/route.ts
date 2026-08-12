import { NextResponse, type NextRequest } from 'next/server';

// 1×1 transparent GIF
const PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64',
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Increment opened count in Supabase (best-effort, no error surfaced to client)
  try {
    const { createSupabaseServerClient } = await import('@/lib/supabase/server');
    const response = NextResponse.next();
    const supabase = createSupabaseServerClient(request, response);
    await supabase.rpc('increment_message_opened', { report_id: id });
  } catch { /* env absent or RPC missing — silently ignore */ }

  return new NextResponse(PIXEL, {
    status: 200,
    headers: {
      'Content-Type':  'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma':        'no-cache',
      'Expires':       '0',
    },
  });
}
