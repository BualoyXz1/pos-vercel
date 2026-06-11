import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const sales = await db.sale.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { id: true, total: true, method: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });

  // Group by date
  const byDate = new Map<string, { date: string; total: number; count: number; cash: number; qr: number }>();

  for (const s of sales) {
    const dateKey = s.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
    const existing = byDate.get(dateKey) || { date: dateKey, total: 0, count: 0, cash: 0, qr: 0 };
    existing.total += s.total;
    existing.count += 1;
    if (s.method === 'cash') existing.cash += s.total;
    if (s.method === 'qr') existing.qr += s.total;
    byDate.set(dateKey, existing);
  }

  // Fill missing dates with zero
  const result = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    result.push(byDate.get(key) || { date: key, total: 0, count: 0, cash: 0, qr: 0 });
  }

  result.reverse(); // oldest first

  const summary = {
    totalRevenue: result.reduce((sum, d) => sum + d.total, 0),
    totalSales: result.reduce((sum, d) => sum + d.count, 0),
    avgPerDay: result.length > 0 ? result.reduce((sum, d) => sum + d.total, 0) / 30 : 0,
  };

  return NextResponse.json({ daily: result, summary });
}
