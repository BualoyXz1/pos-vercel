import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const SECRET = process.env.SESSION_SECRET || 'dev-secret-change-me';
const COOKIE = 'pos_admin';

async function sign(value: string) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(SECRET);
  const data = encoder.encode(value);
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, data);
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function makeToken() {
  const payload = `admin.${Date.now()}`;
  const sig = await sign(payload);
  return `${payload}.${sig}`;
}

export async function verifyToken(token?: string | null) {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const payload = `${parts[0]}.${parts[1]}`;
  const expectedSig = await sign(payload);
  return expectedSig === parts[2];
}

export async function isAdmin() {
  const c = cookies().get(COOKIE)?.value;
  return await verifyToken(c);
}

export async function isAdminReq(req: NextRequest) {
  const c = req.cookies.get(COOKIE)?.value;
  return await verifyToken(c);
}

export const COOKIE_NAME = COOKIE;
