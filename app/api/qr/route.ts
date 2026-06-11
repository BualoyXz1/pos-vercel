import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore - no types
import generatePayload from 'promptpay-qr';
import QRCode from 'qrcode';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const amount = Number(req.nextUrl.searchParams.get('amount') || '0');
  const setting = await db.setting.findUnique({ where: { key: 'promptpay_id' } });
  const id = setting?.value || process.env.PROMPTPAY_ID || '';
  if (!id) return NextResponse.json({ error: 'no promptpay id configured' }, { status: 400 });
  const payload = generatePayload(id, { amount });
  const dataUrl = await QRCode.toDataURL(payload, { margin: 1, width: 480 });
  return NextResponse.json({ dataUrl, payload, id, amount });
}
