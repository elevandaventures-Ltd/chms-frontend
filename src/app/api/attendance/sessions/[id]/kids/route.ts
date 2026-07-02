/**
 * GET  /api/attendance/sessions/:id/kids — list children checked in
 * POST /api/attendance/sessions/:id/kids — check in a child, return pickup code
 */
import { NextResponse, type NextRequest } from 'next/server';

function generateCode() {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}

export async function GET() {
  return NextResponse.json({ data: [] });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  await context.params;
  const body = await request.json() as { childName: string; parentName: string; allergies?: string };
  const record = {
    id:          `k-${Date.now()}`,
    childName:   body.childName,
    parentName:  body.parentName,
    allergies:   body.allergies,
    pickupCode:  generateCode(),
    checkedInAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  return NextResponse.json({ data: record }, { status: 201 });
}
