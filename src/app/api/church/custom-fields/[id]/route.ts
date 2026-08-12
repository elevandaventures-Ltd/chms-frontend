/**
 * PATCH/DELETE /api/church/custom-fields/:id — edit or remove a
 * church-defined member-profile field.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { updateCustomField, deleteCustomField } from '@/lib/church-store';
import type { ChurchCustomField } from '@/lib/church-branding';

type RouteCtx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, ctx: RouteCtx) {
  const { id } = await ctx.params;
  let body: Partial<ChurchCustomField>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  const updated = updateCustomField(id, body);
  if (!updated) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ data: updated });
}

export async function DELETE(_request: NextRequest, ctx: RouteCtx) {
  const { id } = await ctx.params;
  const removed = deleteCustomField(id);
  if (!removed) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ data: { id } });
}
