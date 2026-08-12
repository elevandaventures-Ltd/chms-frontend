import { timeoutFetch, disablePostgrestRetry } from '@/lib/supabase/timeout-fetch';
/**
 * GET /api/attendance/sessions/:id/stream
 *
 * Server-Sent Events stream for the live attendance counter (Day 23).
 *
 * The client connects once; the server pushes a `count` event every time
 * a new check-in is recorded. In dev (no Supabase), the count increments
 * by a random 0-3 every 4 seconds to simulate live activity.
 *
 * In production this listens to Supabase Realtime on the
 * attendance_checkins table and pushes whenever a new row is inserted
 * for this session.
 */
import { NextResponse, type NextRequest } from 'next/server';

export const runtime = 'nodejs'; // SSE requires Node.js runtime

const POLL_INTERVAL_MS = 4000;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: string, data: unknown) {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      }

      let closed = false;
      request.signal.addEventListener('abort', () => { closed = true; });

      // ── Dev fallback: simulate incrementing count ─────────────────────────
      if (!supabaseUrl || !supabaseKey) {
        let count = Math.floor(Math.random() * 50) + 20;
        send('count', { count, sessionId: id });

        const interval = setInterval(() => {
          if (closed) { clearInterval(interval); controller.close(); return; }
          count += Math.floor(Math.random() * 4);
          send('count', { count, sessionId: id });
        }, POLL_INTERVAL_MS);

        return;
      }

      // ── Production: poll Supabase for count changes ───────────────────────
      // (Supabase Realtime JS client doesn't work server-side in SSE context;
      //  instead we poll the DB every 3s — fast enough for a counter widget)
      const { createServerClient } = await import('@supabase/ssr');
      const response = NextResponse.next();
      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll(c: { name: string; value: string }[]) {
            c.forEach(({ name, value }) => response.cookies.set(name, value));
          },
        },
        global: { fetch: timeoutFetch },
      });
      disablePostgrestRetry(supabase);

      async function pollCount() {
        const { count: total } = await supabase
          .from('attendance_checkins')
          .select('*', { count: 'exact', head: true })
          .eq('session_id', id);
        return total ?? 0;
      }

      let lastCount = await pollCount();
      send('count', { count: lastCount, sessionId: id });

      const interval = setInterval(async () => {
        if (closed) { clearInterval(interval); controller.close(); return; }
        const current = await pollCount();
        if (current !== lastCount) {
          lastCount = current;
          send('count', { count: current, sessionId: id });
        }
      }, 3000);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection':    'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
