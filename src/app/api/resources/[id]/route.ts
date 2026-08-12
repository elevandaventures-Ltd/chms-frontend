/**
 * PUT    /api/resources/:id — update resource
 * DELETE /api/resources/:id — delete resource
 */
import { NextResponse, type NextRequest } from 'next/server';

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json() as Record<string, unknown>;
  return NextResponse.json({ data: { id, ...body } });
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return NextResponse.json({ deleted: id });
}
