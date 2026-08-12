/**
 * POST /api/church/branding/logo — upload a church logo file.
 * Uploads to Supabase Storage when configured (same 'avatars' bucket the
 * member-photo upload uses, under a church-logos/ prefix); otherwise
 * returns the file re-encoded as a data URL so the feature still works
 * end-to-end without Supabase Storage configured.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { timeoutFetch, disablePostgrestRetry } from '@/lib/supabase/timeout-fetch';
import { DEMO_CHURCH_ID } from '@/lib/church-store';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('logo');
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: 'validation_error', message: 'No file provided.' }, { status: 400 });
  }
  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: 'validation_error', message: 'Logo must be 2MB or smaller.' }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    const response = NextResponse.next();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookies: { name: string; value: string; options?: CookieOptions }[]) {
          cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options ?? {}));
        },
      },
      global: { fetch: timeoutFetch },
    });
    disablePostgrestRetry(supabase);

    const ext = file.type.split('/')[1] ?? 'png';
    const fileName = `church-logos/${DEMO_CHURCH_ID}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('avatars').upload(fileName, file, { contentType: file.type, upsert: true });
    if (!error) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      return NextResponse.json({ data: { logoUrl: data.publicUrl } });
    }
    console.warn('[api/church/branding/logo] Supabase Storage upload failed, falling back to data URL:', error.message);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUrl = `data:${file.type};base64,${buffer.toString('base64')}`;
  return NextResponse.json({ data: { logoUrl: dataUrl } });
}
