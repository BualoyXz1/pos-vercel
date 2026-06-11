import { NextRequest, NextResponse } from 'next/server';
import { makeToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (password !== (process.env.ADMIN_PASSWORD || 'admin1234')) {
    return NextResponse.json({ error: 'invalid password' }, { status: 401 });
  }
  const token = await makeToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
