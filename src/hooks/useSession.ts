/**
 * useSession — React hook for Supabase session persistence.
 *
 * Responsibilities
 * ─────────────────
 * 1. Returns the current session and user on mount.
 * 2. Subscribes to `onAuthStateChange` so the component re-renders whenever
 *    the session is created, refreshed, or destroyed.
 * 3. Because the browser client is configured with `autoRefreshToken: true`
 *    and `persistSession: true`, token refreshes happen automatically in the
 *    background — this hook just surfaces the latest state.
 *
 * Usage
 * ─────
 * ```tsx
 * const { session, user, loading } = useSession();
 *
 * if (loading) return <Spinner />;
 * if (!session) return <p>Not signed in</p>;
 * return <p>Hello {user?.email}</p>;
 * ```
 */
'use client';

import { useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';

import { getSupabaseBrowserClient } from '@/lib/supabase/client';

type SessionState = {
  session: Session | null;
  user: User | null;
  /** True only during the initial async check on first render. */
  loading: boolean;
};

export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({
    session: null,
    user: null,
    loading: true,
  });

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      // Supabase env vars are not configured — resolve immediately with no session.
      setState({ session: null, user: null, loading: false });
      return;
    }

    // Hydrate from the persisted session stored in localStorage.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({ session, user: session?.user ?? null, loading: false });
    });

    // Listen for session changes: SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ session, user: session?.user ?? null, loading: false });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return state;
}
