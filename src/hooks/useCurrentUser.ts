'use client';

/**
 * useCurrentUser — resolves the authenticated user's display info from
 * the live Supabase session.
 *
 * Returns name, email, initials, avatar URL, and role derived from the
 * session's user_metadata. Falls back gracefully when Supabase env vars
 * are absent (dev without credentials) or no session exists.
 *
 * Used by TopNav and Sidebar so they always reflect the real signed-in user
 * rather than a hardcoded placeholder.
 */
import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { UserRole } from '@/lib/site';

export type CurrentUser = {
  name: string;
  email: string;
  initials: string;
  avatarUrl: string;
  role: UserRole;
  loading: boolean;
};

function deriveInitials(name: string, email: string): string {
  const source = name.trim() || email.trim();
  return source
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

/** Coerce an arbitrary metadata role string to a valid UserRole. */
function coerceRole(raw: unknown): UserRole {
  const valid: UserRole[] = ['admin', 'pastor', 'finance', 'ministry_leader', 'staff', 'member'];
  if (typeof raw === 'string' && (valid as string[]).includes(raw)) return raw as UserRole;
  return 'member';
}

const FALLBACK: CurrentUser = {
  name: '',
  email: '',
  initials: '?',
  avatarUrl: '',
  role: 'member',
  loading: true,
};

export function useCurrentUser(): CurrentUser {
  const [user, setUser] = useState<CurrentUser>(FALLBACK);

  useEffect(() => {
    const sb = getSupabaseBrowserClient();

    if (!sb) {
      // No Supabase credentials — default to admin so all nav items are visible in dev.
      setUser({ ...FALLBACK, role: 'admin', loading: false });
      return;
    }

    function buildUser(sbUser: { email?: string; user_metadata?: Record<string, unknown> } | null): CurrentUser {
      if (!sbUser) return { ...FALLBACK, loading: false };

      const email     = sbUser.email ?? '';
      const name      = String(sbUser.user_metadata?.name ?? '');
      const avatarUrl = String(sbUser.user_metadata?.avatar_url ?? '');
      const role      = coerceRole(sbUser.user_metadata?.role);

      return {
        name,
        email,
        initials: deriveInitials(name, email),
        avatarUrl,
        role,
        loading: false,
      };
    }

    // Hydrate from the persisted session.
    sb.auth.getUser().then(({ data: { user: sbUser } }) => {
      setUser(buildUser(sbUser));
    });

    // Keep in sync when the session changes (sign-in, sign-out, token refresh).
    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      setUser(buildUser(session?.user ?? null));
    });

    return () => subscription.unsubscribe();
  }, []);

  return user;
}
