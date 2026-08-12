/**
 * GET/PUT /api/bulletin/config — the digital bulletin's branding + content
 * config (Day 39 Task 1). In-memory demo store, same convention as the
 * other single-tenant mock stores in this project.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { defaultBulletinConfig, type BulletinConfig } from '@/lib/bulletin';

let config: BulletinConfig = { ...defaultBulletinConfig };

export async function GET() {
  return NextResponse.json({ data: config });
}

export async function PUT(request: NextRequest) {
  let body: Partial<BulletinConfig>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  config = { ...config, ...body, sermonSeries: { ...config.sermonSeries, ...body.sermonSeries } };
  return NextResponse.json({ data: config });
}
