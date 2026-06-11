import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAdminReq } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdminReq(req))) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const id = Number(params.id);
  const body = await req.json();
  const data: any = {};
  for (const k of ['name', 'sku', 'category', 'image']) if (k in body) data[k] = body[k];
  for (const k of ['price', 'cost', 'stock']) if (k in body) data[k] = body[k] == null ? null : Number(body[k]);
  if ('active' in body) data.active = Boolean(body.active);
  const updated = await db.product.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdminReq(req))) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const id = Number(params.id);
  await db.product.update({ where: { id }, data: { active: false } });
  return NextResponse.json({ ok: true });
}
