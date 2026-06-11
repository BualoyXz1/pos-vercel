import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAdminReq } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const rows = await db.setting.findMany();
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;
  if (!map.promptpay_id && process.env.PROMPTPAY_ID) map.promptpay_id = process.env.PROMPTPAY_ID;
  if (!map.shop_name) map.shop_name = 'ร้านของฉัน';
  return NextResponse.json(map);
}

export async function POST(req: NextRequest) {
  if (!(await isAdminReq(req))) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await req.json();
  for (const [k, v] of Object.entries(body)) {
    await db.setting.upsert({
      where: { key: k },
      update: { value: String(v) },
      create: { key: k, value: String(v) },
    });
  }
  return NextResponse.json({ ok: true });
}
