'use client';

import { useEffect, useState } from 'react';
import { subscribeAuth } from '@/lib/supabase/authStore';
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

function coerceRole(raw: unknown): UserRole {
  const valid: UserRole[] = ['admin', 'pastor', 'finance', 'ministry_leader', 'staff', 'member'];
  if (typeof raw === 'string' && (valid as string[]).includes(raw)) return raw as UserRole;
  return 'admin';
}

const LOADING: CurrentUser = { name: '', email: '', initials: '?', avatarUrl: '', role: 'member', loading: true };

export function useCurrentUser(): CurrentUser {
  const [user, setUser] = useState<CurrentUser>(LOADING);

  useEffect(() => {
    return subscribeAuth((session) => {
      const sbUser = session?.user ?? null;
      if (!sbUser) { setUser({ ...LOADING, loading: false }); return; }

      const email     = sbUser.email ?? '';
      const name      = String(sbUser.user_metadata?.name ?? '');
      const avatarUrl = String(sbUser.user_metadata?.avatar_url ?? '');
      const role      = coerceRole(sbUser.user_metadata?.role);

      setUser({ name, email, initials: deriveInitials(name, email), avatarUrl, role, loading: false });
    });
  }, []);

  return user;
}
