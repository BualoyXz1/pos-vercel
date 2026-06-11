import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const threshold = Number(req.nextUrl.searchParams.get('threshold') || '10');

  const products = await db.product.findMany({
    where: {
      active: true,
      stock: { lte: threshold },
    },
    orderBy: [{ stock: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true, stock: true, category: true, price: true, image: true },
  });

  return NextResponse.json(products);
}
