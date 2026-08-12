/**
 * timeout-fetch.ts — bounds how long a Supabase network call can hang.
 *
 * Root-caused from a real report: when the configured Supabase project's
 * hostname doesn't resolve (DNS ENOTFOUND — a deleted/paused project, a
 * typo'd env var, or no network route to it), the Supabase JS client's
 * underlying fetch has no timeout of its own. It waits for the OS's DNS
 * resolver to give up, which took several seconds *per call* in the
 * reported case — and every "try Supabase, fall back to mock" API route in
 * this app pays that tax on every request, not just once. A single page
 * load fires several of these from the shared layout alone (branding,
 * feature flags, suspension status) plus whatever the page itself needs,
 * so the cumulative stall is what read as the whole UI staggering/"shaking"
 * as pieces of it resolved seconds apart.
 *
 * AbortController alone is NOT enough to fix this: Node's fetch (undici)
 * does not reliably cancel a request during the DNS-lookup phase — calling
 * `controller.abort()` while `getaddrinfo` is in flight does not stop that
 * lookup, so the fetch promise still doesn't settle until DNS naturally
 * fails. To guarantee callers never wait longer than the timeout, we race
 * the fetch against an independent timer and move on when the timer wins,
 * regardless of what the underlying fetch is still doing in the background.
 *
 * Pass this as `global.fetch` when constructing a Supabase client so a
 * dead/unreachable project fails fast and falls back to mock data almost
 * immediately instead of stalling the request.
 *
 * This alone turned out to be insufficient, though: `@supabase/postgrest-js`
 * retries every idempotent query up to 3 times on network errors with its
 * own exponential backoff (1s, 2s, 4s) *regardless* of how fast each
 * attempt fails — so even with every attempt failing near-instantly, three
 * attempts plus backoff still added ~7s to every query against an
 * unreachable project. See `disablePostgrestRetry` below.
 */

const DEFAULT_TIMEOUT_MS = 3000;

export function createTimeoutFetch(timeoutMs: number = DEFAULT_TIMEOUT_MS): typeof fetch {
  return (input, init) => {
    const controller = new AbortController();
    const abortTimer = setTimeout(() => controller.abort(), timeoutMs);
    const attempt = fetch(input, { ...init, signal: controller.signal });

    return new Promise<Response>((resolve, reject) => {
      const hardTimer = setTimeout(
        () => reject(new Error(`timeoutFetch: request exceeded ${timeoutMs}ms`)),
        timeoutMs,
      );
      // Passing both handlers to a single .then() attaches a rejection
      // handler directly to `attempt`, marking it handled — a separate
      // `.catch()`/`.finally()` chain would each create their own derived
      // promise that Node tracks independently, and one going unhandled
      // is what caused spurious "unhandledRejection" warnings here before.
      attempt.then(
        (res) => {
          clearTimeout(hardTimer);
          clearTimeout(abortTimer);
          resolve(res);
        },
        (err) => {
          clearTimeout(hardTimer);
          clearTimeout(abortTimer);
          reject(err);
        },
      );
    });
  };
}

/** Shared instance — one timer config is enough for every caller. */
export const timeoutFetch = createTimeoutFetch();

/**
 * Disables @supabase/postgrest-js's built-in retry-with-backoff for every
 * query made through this client.
 *
 * supabase-js's public `createClient`/`createServerClient` options don't
 * expose a way to turn this off (its `db` options forward `schema`,
 * `timeout`, and `urlLengthLimit` to the internal PostgrestClient, but not
 * `retry` — see node_modules/@supabase/supabase-js SupabaseClient.ts). The
 * only way to disable it app-wide instead of per-query-chain (`.retry(false)`
 * on every `.from(...).select(...)` call, individually) is to reach into
 * the internal `rest` client and flip the flag directly; PostgrestClient
 * reads it fresh on every `.from()`/`.rpc()` call, so this only needs to
 * run once, right after construction, before any queries are issued.
 *
 * Retrying is fine against a live, working project — it's only actively
 * harmful when the project is unreachable (dead/paused/misconfigured), which
 * is exactly the case timeoutFetch above exists to fail out of quickly; this
 * closes the gap where retry backoff alone re-introduces multi-second stalls.
 */
export function disablePostgrestRetry(client: unknown): void {
  const rest = (client as { rest?: { retry?: boolean } }).rest;
  if (rest) rest.retry = false;
}
