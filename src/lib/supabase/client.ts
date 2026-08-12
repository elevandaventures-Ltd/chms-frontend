/**
 * Browser-side Supabase client with session persistence and auto token refresh.
 *
 * - persistSession: true  → session survives page reloads (stored in localStorage)
 * - autoRefreshToken: true → client silently refreshes the JWT before it expires
 * - detectSessionInUrl: true → picks up the access_token fragment from magic-link
 *   and OAuth callbacks automatically
 *
 * This module is safe to import from client components and hooks.
 * Import `createSupabaseServerClient` from `@/lib/supabase/server` for
 * middleware and server-only code.
 */
import { createBrowserClient } from '@supabase/ssr';

let client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  // Return the cached singleton during the same page session.
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // Return null gracefully when env vars are absent (e.g., Storybook, tests).
    return null;
  }

  client = createBrowserClient(url, anonKey, {
    auth: {
      persistSession: true,      // Keep the session across page reloads via localStorage.
      autoRefreshToken: true,    // Silently refresh the JWT before it expires.
      detectSessionInUrl: true,  // Handle magic-link / OAuth redirects automatically.
    },
  });

  return client;
}
