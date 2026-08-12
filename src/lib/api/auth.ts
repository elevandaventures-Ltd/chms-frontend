/**
 * Auth/session helpers for the backend API.
 *
 * The frontend authenticates with Supabase directly; the backend trusts the
 * resulting access token. These helpers confirm the token is valid backend-side
 * and surface the tenant identity (church + role) carried in its custom claims.
 */
import { api, getAccessToken } from '@/lib/api/client';
import type { AuthMeResponse } from '@/lib/api/types';

export type BackendIdentity = NonNullable<AuthMeResponse['user']>;

/**
 * Verify the current session against the backend and return the decoded
 * identity ({ userId, email, churchId, role }), or null if not authenticated.
 */
export async function fetchBackendIdentity(): Promise<BackendIdentity | null> {
  const token = await getAccessToken();
  if (!token) return null; // no session → don't bother calling a protected route
  const res = await api.get<AuthMeResponse>('/auth/me');
  return res.user;
}

/** True when a Supabase access token is currently available. */
export async function hasSession(): Promise<boolean> {
  return (await getAccessToken()) !== null;
}
