/**
 * GET/PUT /api/church/branding — logo, accent color, welcome message
 * (Day 47 Task 1). Persists to church_profiles when Supabase is
 * configured and the table exists; otherwise the in-memory church-store.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { getBranding, updateBranding, DEMO_CHURCH_ID } from '@/lib/church-store';
import type { ChurchBranding } from '@/lib/church-branding';

function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function GET() {
  return NextResponse.json({ data: getBranding() });
}

export async function PUT(request: NextRequest) {
  let body: Partial<ChurchBranding>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const data = updateBranding(body);

  if (hasSupabaseEnv()) {
    try {
      const { createSupabaseServerClient } = await import('@/lib/supabase/server');
      const response = NextResponse.next();
      const supabase = createSupabaseServerClient(request, response);
      await supabase.from('church_profiles').upsert({
        church_id: DEMO_CHURCH_ID,
        logo_url: data.logoUrl || null,
        accent_color: data.accentColor,
        welcome_message: data.welcomeMessage,
      });
    } catch (err) {
      console.warn('[api/church/branding] Supabase persist failed (using in-memory store only):', err);
    }
  }

  return NextResponse.json({ data });
}
