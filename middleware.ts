/**
 * Next.js Edge Middleware — protected route guard.
 *
 * How it works
 * ────────────
 * 1. Every request passes through this middleware before hitting a route handler
 *    or page component.
 * 2. For public routes (login, signup, auth callback, static assets) we just
 *    forward the request unchanged.
 * 3. For all other routes we ask Supabase to validate the session cookie.
 *    • If a valid session exists  → forward the request (and let Supabase
 *      refresh the cookie if the token is about to expire).
 *    • If no valid session exists → redirect to /login, preserving the
 *      original URL as a `next` search param so the user lands back here
 *      after signing in.
 *
 * Session persistence
 * ───────────────────
 * The browser client (src/lib/supabase/client.ts) is configured with
 * persistSession and autoRefreshToken so the session survives page reloads
 * without this middleware needing to do anything extra.  Middleware only
 * handles the *server-side* verification leg.
 */
import { NextResponse, type NextRequest } from 'next/server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * Paths that are always reachable without authentication.
 * Regex patterns are matched against the full pathname.
 */
const PUBLIC_PATHS: RegExp[] = [
  /^\/login(\/.*)?$/,           // /login and sub-routes
  /^\/signup(\/.*)?$/,          // /signup and sub-routes
  /^\/auth(\/.*)?$/,            // /auth/callback and any future auth helpers
  /^\/_next(\/.*)?$/,           // Next.js internal assets
  /^\/favicon\.svg$/,           // Favicon
  /^\/api\/auth(\/.*)?$/,       // Auth API routes (signin, signup, magic)
  /^\/onboarding(\/.*)?$/,      // Church onboarding wizard (pre-auth flow)
  /^\/api\/onboarding(\/.*)?$/, // Onboarding API route
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((pattern) => pattern.test(pathname));
}

export async function middleware(request: NextRequest) {
  // Always create a response object first so Supabase can attach/refresh cookies.
  const response = NextResponse.next({ request });

  const { pathname } = request.nextUrl;

  // Skip auth check for public paths (no Supabase call needed).
  if (isPublicPath(pathname)) {
    return response;
  }

  // Validate the session server-side.
  // If Supabase env vars are missing we fail open in dev (no redirect) so
  // the UI is still usable without credentials configured.
  try {
    const supabase = createSupabaseServerClient(request, response);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      // Build the redirect URL, preserving the intended destination.
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  } catch (error) {
    // Supabase env vars are not set — fail open so the app is still reachable
    // locally without credentials (dev / Storybook / CI without secrets).
    const isMissingEnv =
      error instanceof Error && error.message.includes('Missing Supabase');

    if (!isMissingEnv) {
      // Unexpected error — redirect to login rather than surfacing a 500.
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Fall through and serve the page when env vars are absent.
  }

  return response;
}

/**
 * Only run this middleware on pages and API routes — skip static files and
 * Next.js internals (handled by the PUBLIC_PATHS list above as a second
 * safety net, but the matcher is the primary filter).
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static  (static bundle files)
     * - _next/image   (image optimisation endpoint)
     * - favicon.svg   (site icon)
     * - Files with a file extension inside /public
     */
    '/((?!_next/static|_next/image|favicon\\.svg|.*\\.(?:png|jpg|jpeg|gif|webp|ico|svg|css|js|woff2?)).*)',
  ],
};
