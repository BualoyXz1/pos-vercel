'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart';
import { thb } from '@/lib/money';

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string | null;
  image: string | null;
};

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<string>('ทั้งหมด');
  const [cartOpen, setCartOpen] = useState(false);
  const [pay, setPay] = useState(false);
  const cart = useCart();

  useEffect(() => {
    fetch('/api/products').then((r) => r.json()).then(setProducts);
  }, []);

  const categories = useMemo(() => {
    const s = new Set<string>();
    products.forEach((p) => p.category && s.add(p.category));
    return ['ทั้งหมด', ...Array.from(s)];
  }, [products]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return products.filter((p) => {
      if (cat !== 'ทั้งหมด' && p.category !== cat) return false;
      if (term && !p.name.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [products, q, cat]);

  return (
    <div className="min-h-screen pb-28">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="text-xl font-bold text-brand-700">POS</div>
          <input
            className="input flex-1"
            placeholder="ค้นหาสินค้า..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Link href="/admin" className="btn-ghost !px-3 !py-2 text-sm">
            จัดการ
          </Link>
        </div>
        <div className="px-2 pb-2 overflow-x-auto no-scrollbar flex gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm border ${
                cat === c
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </header>

      <main className="px-3 pt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filtered.map((p) => (
          <button
            key={p.id}
            disabled={p.stock <= 0}
            onClick={() => cart.add({ productId: p.id, name: p.name, price: p.price, image: p.image })}
            className="card overflow-hidden text-left active:scale-[0.98] transition disabled:opacity-40"
          >
            <div className="aspect-square bg-slate-100 flex items-center justify-center overflow-hidden">
              {p.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <span className="text-3xl text-slate-300">฿</span>
              )}
            </div>
            <div className="p-2.5">
              <div className="text-sm font-medium line-clamp-2 min-h-[2.5rem]">{p.name}</div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-brand-700 font-semibold">{thb(p.price)}</span>
                <span className={`text-xs ${p.stock <= 5 ? 'text-rose-500' : 'text-slate-400'}`}>
                  คงเหลือ {p.stock}
                </span>
              </div>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-slate-400 py-16">ไม่พบสินค้า</div>
        )}
      </main>

      {/* Floating cart bar */}
      {cart.count() > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed left-3 right-3 bottom-3 z-30 btn-primary !py-4 shadow-lg flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <span className="bg-white/20 rounded-full w-8 h-8 grid place-items-center font-bold">
              {cart.count()}
            </span>
            <span>ดูตะกร้า</span>
          </span>
          <span className="font-bold">{thb(cart.total())}</span>
        </button>
      )}

      {cartOpen && <CartSheet onClose={() => setCartOpen(false)} onCheckout={() => { setCartOpen(false); setPay(true); }} />}
      {pay && (
        <PaymentSheet
          onClose={() => setPay(false)}
          onPaid={() => {
            cart.clear();
            setPay(false);
            // refresh stock
            fetch('/api/products').then((r) => r.json()).then(setProducts);
          }}
        />
      )}
    </div>
  );
}

function CartSheet({ onClose, onCheckout }: { onClose: () => void; onCheckout: () => void }) {
  const cart = useCart();
  return (
    <div className="fixed inset-0 z-40 bg-black/40 flex items-end" onClick={onClose}>
      <div
        className="w-full bg-white rounded-t-3xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <div className="font-semibold text-lg">ตะกร้าสินค้า</div>
          <button onClick={cart.clear} className="text-sm text-rose-500">ล้างทั้งหมด</button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.items.map((i) => (
            <div key={i.productId} className="flex items-center gap-3 p-2 card">
              <div className="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                {i.image && <img src={i.image} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{i.name}</div>
                <div className="text-sm text-slate-500">{thb(i.price)}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => cart.dec(i.productId)} className="w-9 h-9 rounded-full bg-slate-100 text-lg">−</button>
                <span className="w-6 text-center font-medium">{i.qty}</span>
                <button onClick={() => cart.inc(i.productId)} className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 text-lg">+</button>
              </div>
            </div>
          ))}
          {cart.items.length === 0 && <div className="text-center text-slate-400 py-10">ตะกร้าว่าง</div>}
        </div>
        <div className="p-4 border-t space-y-3">
          <div className="flex justify-between text-lg">
            <span>รวม</span>
            <span className="font-bold text-brand-700">{thb(cart.total())}</span>
          </div>
          <button disabled={cart.items.length === 0} onClick={onCheckout} className="btn-primary w-full !py-4 disabled:opacity-50">
            ชำระเงิน
          </button>
        </div>
      </div>
    </div>
  );
}

function PaymentSheet({ onClose, onPaid }: { onClose: () => void; onPaid: () => void }) {
  const cart = useCart();
  const total = cart.total();
  const [method, setMethod] = useState<'cash' | 'qr'>('cash');
  const [received, setReceived] = useState<string>('');
  const [qr, setQr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const recv = Number(received) || 0;
  const change = Math.max(0, recv - total);
  const enough = recv >= total;

  useEffect(() => {
    if (method !== 'qr') return;
    setQr(null);
    fetch(`/api/qr?amount=${total.toFixed(2)}`)
      .then((r) => r.json())
      .then((d) => setQr(d.dataUrl || null))
      .catch(() => setQr(null));
  }, [method, total]);

  const quick = [total, roundUp(total, 20), roundUp(total, 50), roundUp(total, 100), roundUp(total, 500), roundUp(total, 1000)];
  const uniqQuick = Array.from(new Set(quick)).slice(0, 6);

  async function confirm() {
    setLoading(true);
    try {
      const r = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          method,
          received: method === 'qr' ? total : recv,
          items: cart.items.map((i) => ({ productId: i.productId, qty: i.qty })),
        }),
      });
      if (!r.ok) throw new Error('failed');
      onPaid();
    } catch {
      alert('บันทึกการขายล้มเหลว');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end" onClick={onClose}>
      <div className="w-full bg-white rounded-t-3xl max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b flex items-center justify-between">
          <div className="font-semibold text-lg">ชำระเงิน</div>
          <button onClick={onClose} className="text-slate-400 text-2xl leading-none">×</button>
        </div>

        <div className="p-4 space-y-4">
          <div className="text-center bg-brand-50 rounded-2xl p-5">
            <div className="text-sm text-brand-700/70">ยอดที่ต้องชำระ</div>
            <div className="text-4xl font-bold text-brand-700 mt-1">{thb(total)}</div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setMethod('cash')}
              className={`py-3 rounded-xl font-medium border ${method === 'cash' ? 'bg-brand-600 text-white border-brand-600' : 'bg-white border-slate-200'}`}
            >
              💵 เงินสด
            </button>
            <button
              onClick={() => setMethod('qr')}
              className={`py-3 rounded-xl font-medium border ${method === 'qr' ? 'bg-brand-600 text-white border-brand-600' : 'bg-white border-slate-200'}`}
            >
              📱 พร้อมเพย์ QR
            </button>
          </div>

          {method === 'cash' && (
            <div className="space-y-3">
              <div>
                <label className="label">รับเงิน (บาท)</label>
                <input
                  className="input text-2xl font-semibold text-right"
                  inputMode="decimal"
                  type="number"
                  value={received}
                  onChange={(e) => setReceived(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {uniqQuick.map((v) => (
                  <button
                    key={v}
                    onClick={() => setReceived(String(v))}
                    className="px-3 py-2 rounded-full bg-slate-100 text-sm"
                  >
                    {thb(v)}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4">
                <span className="text-slate-600">เงินทอน</span>
                <span className={`text-2xl font-bold ${enough ? 'text-brand-700' : 'text-slate-300'}`}>
                  {thb(change)}
                </span>
              </div>
            </div>
          )}

          {method === 'qr' && (
            <div className="text-center">
              {qr ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qr} alt="PromptPay QR" className="mx-auto w-64 h-64 rounded-2xl border border-slate-200" />
              ) : (
                <div className="w-64 h-64 mx-auto bg-slate-100 rounded-2xl grid place-items-center text-slate-400">
                  กำลังสร้าง QR...
                </div>
              )}
              <div className="text-sm text-slate-500 mt-2">สแกนเพื่อชำระ {thb(total)}</div>
            </div>
          )}

          <button
            onClick={confirm}
            disabled={loading || (method === 'cash' && !enough)}
            className="btn-primary w-full !py-4 disabled:opacity-50"
          >
            {loading ? 'กำลังบันทึก...' : 'ยืนยันการชำระเงิน'}
          </button>
        </div>
      </div>
    </div>
  );
}

function roundUp(value: number, step: number) {
  return Math.ceil(value / step) * step;
}
