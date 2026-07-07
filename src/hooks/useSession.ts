'use client';

import { useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { subscribeAuth } from '@/lib/supabase/authStore';

type SessionState = {
  session: Session | null;
  user: User | null;
  loading: boolean;
};

export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({ session: null, user: null, loading: true });

  useEffect(() => {
    return subscribeAuth((session) => {
      setState({ session, user: session?.user ?? null, loading: false });
    });
  }, []);

  return state;
}
