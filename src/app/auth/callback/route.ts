/**
 * Auth callback route — handles magic-link and OAuth redirects from Supabase.
 *
 * After a successful magic-link click or OAuth sign-in Supabase redirects the
 * browser to:
 *
 *   http://localhost:3000/auth/callback?code=<PKCE_code>
 *
 * This handler exchanges the one-time code for a session, which Supabase
 * stores as a cookie.  The middleware then sees the cookie on every subsequent
 * request and keeps the session alive through `getSession()`.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // `next` lets us redirect to the page the user originally requested.
  const next = searchParams.get('next') ?? '/';

  if (!code) {
    // No code in the URL — redirect to login with an error hint.
    return NextResponse.redirect(
      new URL('/login?error=missing_code', origin),
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(
      new URL('/login?error=missing_env', origin),
    );
  }

  const response = NextResponse.redirect(new URL(next, origin));

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options ?? {});
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, origin),
    );
  }

  // Session cookie has been set on the response — redirect to the intended page.
  return response;
}
