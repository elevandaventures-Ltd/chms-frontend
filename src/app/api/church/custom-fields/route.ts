/**
 * GET/POST /api/church/custom-fields — church-defined member-profile
 * fields (Day 49 Task 2).
 */
import { NextResponse, type NextRequest } from 'next/server';
import { listCustomFields, addCustomField } from '@/lib/church-store';
import type { ChurchCustomField } from '@/lib/church-branding';

export async function GET() {
  return NextResponse.json({ data: listCustomFields() });
}

export async function POST(request: NextRequest) {
  let body: Partial<ChurchCustomField>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  if (!body.label?.trim() || !body.type) {
    return NextResponse.json({ error: 'validation_error', message: 'Label and type are required.' }, { status: 400 });
  }

  const field = addCustomField({
    label: body.label.trim(),
    type: body.type,
    options: body.type === 'dropdown' ? (body.options ?? []) : undefined,
    required: body.required ?? false,
  });
  return NextResponse.json({ data: field }, { status: 201 });
}
