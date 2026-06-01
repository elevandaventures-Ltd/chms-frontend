import { NextResponse } from 'next/server';

import { createUser, isValidEmail } from '@/lib/auth-store';

function base64url(obj: unknown) {
  return Buffer.from(JSON.stringify(obj)).toString('base64url');
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body?.name ?? '').trim();
    const email = String(body?.email ?? '').trim().toLowerCase();
    const password = String(body?.password ?? '');

    if (!name) {
      return NextResponse.json({ error: 'invalid_name' }, { status: 400 });
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'weak_password' }, { status: 400 });
    }

    const user = await createUser({ name, email, password });
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = { sub: user.id, email: user.email, name: user.name, iat: Math.floor(Date.now() / 1000) };
    const token = `${base64url(header)}.${base64url(payload)}.signature`;

    console.log('[api/auth/signup] Created account:', { email: user.email, name: user.name });

    return NextResponse.json({ token, user: { id: user.id, email: user.email, name: user.name } }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unexpected';

    if (message === 'already_exists') {
      return NextResponse.json({ error: 'already_exists' }, { status: 409 });
    }

    if (message === 'invalid_email') {
      return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
    }

    return NextResponse.json({ error: 'unexpected' }, { status: 500 });
  }
}
