/**
 * connectivity.ts — Day 54 Task 1: offline-mode detection service.
 * Combines `navigator.onLine` (instant, but only reflects the network
 * interface — a laptop connected to Wi-Fi with no internet still reports
 * `true`) with a periodic ping to /api/health every 30s, which actually
 * confirms this server is reachable.
 *
 * A plain module-level pub/sub rather than React context, so the same
 * live connectivity state is available to non-component code too — the
 * Day 53 offline check-in flow (lib/offline-sync.ts callers) reads
 * `isOnline()` directly without needing a hook.
 */

const PING_INTERVAL_MS = 30_000;
const PING_TIMEOUT_MS = 6_000;
// Require this many consecutive pings to agree before actually flipping
// state. A single slow/timed-out response (e.g. a dev-mode route
// compiling on demand, or one dropped packet) would otherwise flip the
// banner on and off by itself — every flip reflows the whole page, since
// the banner sits in normal document flow, which reads as "everything
// shaking". Real connectivity loss stays flagged; one-off blips don't.
const CONFIRMATIONS_REQUIRED = 2;

type Listener = (online: boolean) => void;

let online = typeof navigator !== 'undefined' ? navigator.onLine : true;
let pendingValue: boolean | null = null;
let pendingCount = 0;
const listeners = new Set<Listener>();
let started = false;
let intervalId: ReturnType<typeof setInterval> | null = null;

export function isOnline(): boolean {
  return online;
}

export function subscribeConnectivity(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Authoritative signal (the OS/browser itself reports no network) —
 *  applied immediately, no debounce needed since it isn't subject to the
 *  "one slow server response" false-positive that the health ping is. */
function setOnline(next: boolean) {
  pendingValue = next;
  pendingCount = CONFIRMATIONS_REQUIRED;
  if (next === online) return;
  online = next;
  listeners.forEach((l) => l(next));
}

/** Health-ping result — debounced, since a single timeout (a dev-mode
 *  route compiling on demand, a dropped packet) shouldn't be enough to
 *  flip the banner on its own. */
function reportReading(next: boolean) {
  if (next !== pendingValue) {
    pendingValue = next;
    pendingCount = 1;
  } else {
    pendingCount += 1;
  }

  if (pendingCount < CONFIRMATIONS_REQUIRED || next === online) return;
  online = next;
  listeners.forEach((l) => l(next));
}

async function pingHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);
    const res = await fetch('/api/health', { cache: 'no-store', signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

async function tick() {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    setOnline(false); // authoritative — same fast path as the 'offline' event
    return;
  }
  reportReading(await pingHealth());
}

/** Idempotent — safe to call from every component that wants connectivity
 *  state; only the first call actually wires up listeners/the interval. */
export function startConnectivityMonitor(): void {
  if (started || typeof window === 'undefined') return;
  started = true;

  window.addEventListener('online', () => { void tick(); });
  window.addEventListener('offline', () => setOnline(false));

  void tick();
  intervalId = setInterval(() => { void tick(); }, PING_INTERVAL_MS);
}

export function stopConnectivityMonitor(): void {
  if (intervalId) clearInterval(intervalId);
  intervalId = null;
  started = false;
}
