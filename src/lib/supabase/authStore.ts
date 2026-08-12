'use client';

/**
 * Singleton auth store — one onAuthStateChange listener for the entire app.
 * Both useSession and useCurrentUser subscribe to this instead of registering
 * their own listeners, which prevents concurrent IndexedDB write conflicts.
 */
import type { Session, User } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from './client';

type Listener = (session: Session | null) => void;

let session: Session | null = null;
let initialised = false;
const listeners = new Set<Listener>();

function notify(s: Session | null) {
  session = s;
  listeners.forEach((fn) => fn(s));
}

function init() {
  if (initialised) return;
  initialised = true;

  const sb = getSupabaseBrowserClient();
  if (!sb) return;

  // Hydrate once from persisted session — no network call.
  sb.auth.getSession().then(({ data }) => notify(data.session));

  // Single global listener.
  sb.auth.onAuthStateChange((_event, s) => notify(s));
}

export function getSession() { return session; }

export function subscribeAuth(fn: Listener): () => void {
  init();
  listeners.add(fn);
  // Immediately call with current value so the subscriber doesn't wait.
  fn(session);
  return () => { listeners.delete(fn); };
}
