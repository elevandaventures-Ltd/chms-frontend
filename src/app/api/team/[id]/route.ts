/**
 * PATCH  /api/team/:id — change a staff member's role (role dropdown per row).
 * DELETE /api/team/:id — remove a staff member.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { updateStaffRole, removeStaff } from '@/lib/church-store';
import type { UserRole } from '@/lib/site';

type RouteCtx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, ctx: RouteCtx) {
  const { id } = await ctx.params;
  let body: { role?: UserRole };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  if (!body.role) return NextResponse.json({ error: 'validation_error' }, { status: 400 });

  const updated = updateStaffRole(id, body.role);
  if (!updated) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ data: updated });
}

export async function DELETE(_request: NextRequest, ctx: RouteCtx) {
  const { id } = await ctx.params;
  const removed = removeStaff(id);
  if (!removed) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ data: { id } });
}
