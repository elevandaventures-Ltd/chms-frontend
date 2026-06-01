import { NextResponse } from 'next/server';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email ?? '').trim().toLowerCase();

    if (!email || !emailPattern.test(email)) {
      return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
    }

    if (email.includes('missing') || email.endsWith('@notfound.com')) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    // Simulate sending a magic link — server would log/send email in real app
    console.log(`[api/auth/magic] Magic link requested for ${email}`);

    return NextResponse.json({ message: 'sent' });
  } catch (err) {
    return NextResponse.json({ error: 'unexpected' }, { status: 500 });
  }
}
