/**
 * POST /api/onboarding
 *
 * Creates a church record in the `churches` Supabase table.
 *
 * Expected body (JSON):
 * {
 *   churchName, denomination,
 *   contactName, contactEmail, contactPhone?,
 *   addressLine1, addressLine2?, city, state, postalCode, country
 * }
 *
 * Returns:
 *   201  { id, churchName }          — record created
 *   400  { error: 'validation_error', fields: {...} }
 *   500  { error: 'server_error' }
 *
 * RLS note: The `churches` table should have an RLS INSERT policy that
 * allows authenticated users to create a record for their own tenant
 * (e.g., auth.uid() matches owner_id).  The select policy should restrict
 * rows to the owner so cross-tenant queries return 0 rows.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// ─── Validation ───────────────────────────────────────────────────────────────

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ChurchPayload = {
  churchName: string;
  denomination: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

type FieldErrors = Partial<Record<keyof ChurchPayload, string>>;

function validate(body: Partial<ChurchPayload>): FieldErrors {
  const errors: FieldErrors = {};

  if (!body.churchName?.trim())                    errors.churchName  = 'Church name is required.';
  if (!body.denomination?.trim())                  errors.denomination = 'Denomination is required.';
  if (!body.contactName?.trim())                   errors.contactName = 'Contact name is required.';
  if (!emailPattern.test(body.contactEmail ?? '')) errors.contactEmail = 'Valid email is required.';
  if (!body.addressLine1?.trim())                  errors.addressLine1 = 'Street address is required.';
  if (!body.city?.trim())                          errors.city        = 'City is required.';
  if (!body.state?.trim())                         errors.state       = 'State is required.';
  if (!body.postalCode?.trim())                    errors.postalCode  = 'Postal code is required.';
  if (!body.country?.trim())                       errors.country     = 'Country is required.';

  return errors;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // Parse body
  let body: Partial<ChurchPayload>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  // Validate
  const fieldErrors = validate(body);
  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json({ error: 'validation_error', fields: fieldErrors }, { status: 400 });
  }

  // Check env vars — if absent, fall back to a mock 201 response so the
  // wizard still completes in dev without Supabase credentials.
  const supabaseUrl    = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[api/onboarding] Supabase env vars missing — returning mock success.');
    return NextResponse.json(
      { id: `mock-${Date.now()}`, churchName: body.churchName },
      { status: 201 },
    );
  }

  // Build a server Supabase client that forwards the user's session cookie.
  const response = NextResponse.next();
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options ?? {});
        });
      },
    },
  });

  // Insert the church record.
  // Column names match the snake_case convention Supabase expects.
  const { data, error } = await supabase
    .from('churches')
    .insert({
      name:          body.churchName!.trim(),
      denomination:  body.denomination!.trim(),
      contact_name:  body.contactName!.trim(),
      contact_email: body.contactEmail!.trim().toLowerCase(),
      contact_phone: body.contactPhone?.trim() ?? null,
      address_line1: body.addressLine1!.trim(),
      address_line2: body.addressLine2?.trim() ?? null,
      city:          body.city!.trim(),
      state:         body.state!.trim(),
      postal_code:   body.postalCode!.trim(),
      country:       body.country!.trim(),
    })
    .select('id, name')
    .single();

  if (error) {
    console.error('[api/onboarding] Supabase insert error:', error.message);
    return NextResponse.json({ error: 'server_error', detail: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id, churchName: data.name }, { status: 201 });
}
