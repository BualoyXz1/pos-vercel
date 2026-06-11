import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAdminReq } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const products = await db.product.findMany({
    where: { active: true },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  if (!(await isAdminReq(req))) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await req.json();
  const created = await db.product.create({
    data: {
      name: String(body.name).trim(),
      sku: body.sku || null,
      price: Number(body.price) || 0,
      cost: body.cost != null ? Number(body.cost) : null,
      stock: Number(body.stock) || 0,
      category: body.category || null,
      image: body.image || null,
    },
  });
  return NextResponse.json(created);
}
