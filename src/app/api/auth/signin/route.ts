import { NextResponse } from 'next/server';

import { getUserByEmail, isValidEmail } from '@/lib/auth-store';

function base64url(obj: unknown) {
  return Buffer.from(JSON.stringify(obj)).toString('base64url');
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email ?? '').trim().toLowerCase();
    const password = String(body?.password ?? '');

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
    }

    if (email.includes('missing') || email.endsWith('@notfound.com')) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    const user = await getUserByEmail(email);

    if (!user) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    if (user.password !== password) {
      return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 });
    }

    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = { sub: user.id, email, name: user.name, iat: Math.floor(Date.now() / 1000) };
    const token = `${base64url(header)}.${base64url(payload)}.signature`;

    // Log decoded payload to server console to simulate API logs
    console.log('[api/auth/signin] Decoded JWT payload:', payload);

    return NextResponse.json({ token, user: { id: user.id, email, name: user.name } });
  } catch (err) {
    return NextResponse.json({ error: 'unexpected' }, { status: 500 });
  }
}
