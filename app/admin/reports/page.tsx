'use client';
import { useEffect, useState } from 'react';
import { thb } from '@/lib/money';

type DailyData = {
  date: string;
  total: number;
  count: number;
  cash: number;
  qr: number;
};

type Summary = {
  totalRevenue: number;
  totalSales: number;
  avgPerDay: number;
};

export default function ReportsPage() {
  const [data, setData] = useState<DailyData[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [view, setView] = useState<'chart' | 'table'>('chart');

  useEffect(() => {
    fetch('/api/reports/daily')
      .then((r) => r.json())
      .then((d) => {
        setData(d.daily || []);
        setSummary(d.summary || null);
      });
  }, []);

  const maxTotal = Math.max(...data.map((d) => d.total), 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">รายงานรายได้ (30 วันย้อนหลัง)</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setView('chart')}
            className={`px-3 py-1.5 rounded-lg text-sm ${view === 'chart' ? 'bg-brand-600 text-white' : 'bg-white border'}`}
          >
            📊 กราฟ
          </button>
          <button
            onClick={() => setView('table')}
            className={`px-3 py-1.5 rounded-lg text-sm ${view === 'table' ? 'bg-brand-600 text-white' : 'bg-white border'}`}
          >
            📋 ตาราง
          </button>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="card p-4">
            <div className="text-sm text-slate-500">รายได้รวม 30 วัน</div>
            <div className="text-2xl font-bold text-brand-700 mt-1">{thb(summary.totalRevenue)}</div>
          </div>
          <div className="card p-4">
            <div className="text-sm text-slate-500">จำนวนบิลทั้งหมด</div>
            <div className="text-2xl font-bold text-slate-700 mt-1">{summary.totalSales}</div>
          </div>
          <div className="card p-4">
            <div className="text-sm text-slate-500">เฉลี่ยต่อวัน</div>
            <div className="text-2xl font-bold text-slate-700 mt-1">{thb(summary.avgPerDay)}</div>
          </div>
        </div>
      )}

      {view === 'chart' && (
        <div className="card p-4">
          <div className="space-y-1.5">
            {data.slice(-14).map((d) => (
              <div key={d.date} className="flex items-center gap-3">
                <div className="text-xs text-slate-500 w-20 shrink-0">
                  {new Date(d.date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}
                </div>
                <div className="flex-1 bg-slate-100 rounded-full h-8 overflow-hidden relative">
                  <div
                    className="bg-brand-500 h-full transition-all flex items-center justify-end pr-2"
                    style={{ width: `${(d.total / maxTotal) * 100}%` }}
                  >
                    {d.total > 0 && (
                      <span className="text-xs font-medium text-white">{thb(d.total)}</span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-slate-400 w-12 text-right">{d.count} บิล</div>
              </div>
            ))}
          </div>
          <div className="text-xs text-slate-400 mt-3 text-center">แสดง 14 วันล่าสุด</div>
        </div>
      )}

      {view === 'table' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-3 py-2 text-left">วันที่</th>
                <th className="px-3 py-2 text-right">รายได้รวม</th>
                <th className="px-3 py-2 text-right">จำนวนบิล</th>
                <th className="px-3 py-2 text-right">เงินสด</th>
                <th className="px-3 py-2 text-right">QR</th>
              </tr>
            </thead>
            <tbody>
              {data.slice().reverse().map((d) => (
                <tr key={d.date} className="border-b last:border-0">
                  <td className="px-3 py-2">
                    {new Date(d.date).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold">{thb(d.total)}</td>
                  <td className="px-3 py-2 text-right">{d.count}</td>
                  <td className="px-3 py-2 text-right text-slate-600">{thb(d.cash)}</td>
                  <td className="px-3 py-2 text-right text-slate-600">{thb(d.qr)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
