'use client';

/**
 * useBackendSession — resolves the backend identity for the current Supabase
 * session and keeps it in sync with auth state changes (sign-in, sign-out,
 * token refresh).
 *
 * This is the bridge between the frontend's Supabase session and the Fastify
 * backend: it confirms the token verifies server-side and exposes the tenant
 * claims (churchId, role) the backend authorises requests with.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { fetchBackendIdentity, type BackendIdentity } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';

export type BackendSession = {
  identity: BackendIdentity | null;
  /** True once the initial resolution has completed. */
  ready: boolean;
  /** Non-null when the last /auth/me call failed (e.g. backend down, 401). */
  error: string | null;
  /** Manually re-resolve (e.g. after creating a church / refreshing claims). */
  refresh: () => Promise<void>;
};

export function useBackendSession(): BackendSession {
  const [identity, setIdentity] = useState<BackendIdentity | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const resolve = useCallback(async () => {
    try {
      const id = await fetchBackendIdentity();
      if (!mounted.current) return;
      setIdentity(id);
      setError(null);
    } catch (err) {
      if (!mounted.current) return;
      setIdentity(null);
      // A 401 just means "not signed in" — not a surfaced error.
      setError(err instanceof ApiError && err.status === 401 ? null : (err as Error).message);
    } finally {
      if (mounted.current) setReady(true);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    void resolve();

    // Re-resolve whenever the Supabase session changes.
    const sb = getSupabaseBrowserClient();
    const sub = sb?.auth.onAuthStateChange(() => { void resolve(); });

    return () => {
      mounted.current = false;
      sub?.data.subscription.unsubscribe();
    };
  }, [resolve]);

  return { identity, ready, error, refresh: resolve };
}
