import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const items: Array<{ productId: number; qty: number }> = body.items || [];
  const method = body.method === 'qr' ? 'qr' : 'cash';
  const received = Number(body.received) || 0;

  if (!items.length) return NextResponse.json({ error: 'empty cart' }, { status: 400 });

  const sale = await db.$transaction(async (tx) => {
    const products = await tx.product.findMany({ where: { id: { in: items.map((i) => i.productId) } } });
    const map = new Map(products.map((p) => [p.id, p]));
    let total = 0;
    const saleItems = items.map((i) => {
      const p = map.get(i.productId);
      if (!p) throw new Error('product not found');
      total += p.price * i.qty;
      return { productId: p.id, name: p.name, price: p.price, qty: i.qty };
    });
    const change = Math.max(0, received - total);
    const created = await tx.sale.create({
      data: {
        total,
        received: method === 'qr' ? total : received,
        change: method === 'qr' ? 0 : change,
        method,
        items: { create: saleItems },
      },
      include: { items: true },
    });
    for (const i of items) {
      await tx.product.update({ where: { id: i.productId }, data: { stock: { decrement: i.qty } } });
    }
    return created;
  });

  return NextResponse.json(sale);
}
