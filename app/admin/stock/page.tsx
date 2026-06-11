'use client';
import { useEffect, useState } from 'react';
import { thb } from '@/lib/money';

type Product = {
  id: number;
  name: string;
  stock: number;
  category: string | null;
  price: number;
  image: string | null;
};

export default function StockPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [threshold, setThreshold] = useState(10);
  const [checked, setChecked] = useState<Set<number>>(new Set());

  useEffect(() => {
    load();
  }, [threshold]);

  async function load() {
    const r = await fetch(`/api/stock/low?threshold=${threshold}`);
    setItems(await r.json());
    setChecked(new Set());
  }

  function toggle(id: number) {
    const next = new Set(checked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setChecked(next);
  }

  function toggleAll() {
    if (checked.size === items.length) setChecked(new Set());
    else setChecked(new Set(items.map((i) => i.id)));
  }

  function print() {
    const list = items.filter((i) => !checked.has(i.id));
    if (list.length === 0) {
      alert('ไม่มีรายการที่ต้องพิมพ์ (เลือกไว้หมดแล้ว)');
      return;
    }

    const today = new Date().toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const rows = list.map((i, idx) => `
      <tr>
        <td style="text-align:center; border:1px solid #ddd; padding:8px">${idx + 1}</td>
        <td style="border:1px solid #ddd; padding:8px">☐</td>
        <td style="border:1px solid #ddd; padding:8px">${i.name}</td>
        <td style="border:1px solid #ddd; padding:8px">${i.category || '-'}</td>
        <td style="text-align:center; border:1px solid #ddd; padding:8px; ${i.stock === 0 ? 'color:red; font-weight:bold' : 'color:orange'}">${i.stock}</td>
        <td style="border:1px solid #ddd; padding:8px"></td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>รายการสินค้าที่ต้องสั่งซื้อ</title>
        <style>
          @media print {
            body { margin: 0; }
            button { display: none; }
          }
          body {
            font-family: 'Sarabun', 'Arial', sans-serif;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          th {
            background: #f3f4f6;
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
          }
          .print-btn {
            background: #059669;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin: 10px 0;
          }
          .print-btn:hover {
            background: #047857;
          }
        </style>
      </head>
      <body>
        <button class="print-btn" onclick="window.print()">🖨️ พิมพ์</button>

        <div class="header">
          <h2 style="margin:0">รายการสินค้าที่ต้องสั่งซื้อ</h2>
          <p style="margin:5px 0; color:#666">วันที่พิมพ์: ${today}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width:40px; text-align:center">#</th>
              <th style="width:40px; text-align:center">✓</th>
              <th>ชื่อสินค้า</th>
              <th style="width:120px">หมวดหมู่</th>
              <th style="width:80px; text-align:center">คงเหลือ</th>
              <th style="width:100px">จำนวนซื้อ</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div style="margin-top:30px; border-top:1px solid #ddd; padding-top:15px">
          <p style="margin:0"><strong>ทั้งหมด ${list.length} รายการ</strong></p>
          <p style="margin:5px 0; color:#666; font-size:14px">หมายเหตุ: กรุณาตรวจสอบและเติมจำนวนที่ต้องการสั่งซื้อในช่อง "จำนวนซื้อ"</p>
        </div>
      </body>
      </html>
    `;

    const win = window.open('', '_blank');
    if (!win) {
      alert('กรุณาอนุญาตให้เปิด popup');
      return;
    }
    win.document.write(html);
    win.document.close();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold">สต๊อกใกล้หมด</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">แสดงสินค้าที่เหลือ ≤</label>
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value) || 10)}
            className="input w-20 !py-1.5"
          />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="card p-10 text-center text-slate-400">
          ไม่มีสินค้าที่สต๊อกเหลือ ≤ {threshold}
        </div>
      ) : (
        <>
          <div className="card p-3 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={checked.size === items.length}
                onChange={toggleAll}
                className="w-4 h-4"
              />
              <span className="text-slate-600">
                {checked.size > 0 ? `เลือกแล้ว ${checked.size} รายการ` : `ทั้งหมด ${items.length} รายการ`}
              </span>
            </div>
            <button onClick={print} className="btn-ghost !py-1.5 text-sm">
              🖨️ พิมพ์รายการ
            </button>
          </div>

          <div className="space-y-2">
            {items.map((i) => (
              <div
                key={i.id}
                onClick={() => toggle(i.id)}
                className={`card p-3 flex items-center gap-3 cursor-pointer transition ${
                  checked.has(i.id) ? 'bg-slate-50 opacity-50' : 'hover:bg-slate-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked.has(i.id)}
                  onChange={() => {}}
                  className="w-5 h-5 shrink-0"
                />
                <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                  {i.image && <img src={i.image} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{i.name}</div>
                  <div className="text-sm text-slate-500">{i.category || 'ไม่มีหมวด'}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`font-semibold ${i.stock === 0 ? 'text-rose-600' : 'text-orange-600'}`}>
                    {i.stock === 0 ? 'หมดสต๊อก' : `เหลือ ${i.stock}`}
                  </div>
                  <div className="text-xs text-slate-500">{thb(i.price)}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
