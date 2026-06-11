'use client';
import { useEffect, useRef, useState } from 'react';
import { thb } from '@/lib/money';

type Product = {
  id: number;
  name: string;
  sku: string | null;
  price: number;
  stock: number;
  category: string | null;
  image: string | null;
};

export default function AdminProducts() {
  const [items, setItems] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);

  async function load() {
    const r = await fetch('/api/products');
    setItems(await r.json());
  }
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">จัดการสินค้า</h1>
        <button onClick={() => setCreating(true)} className="btn-primary">+ เพิ่มสินค้า</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((p) => (
          <button
            key={p.id}
            onClick={() => setEditing(p)}
            className="card p-3 flex gap-3 text-left active:scale-[0.99]"
          >
            <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden shrink-0">
              {p.image && <img src={p.image} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{p.name}</div>
              <div className="text-sm text-slate-500">{p.category || 'ไม่มีหมวด'}</div>
              <div className="mt-1 flex justify-between">
                <span className="font-semibold text-brand-700">{thb(p.price)}</span>
                <span className="text-sm text-slate-500">คงเหลือ {p.stock}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {(creating || editing) && (
        <ProductForm
          initial={editing}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSaved={() => { setEditing(null); setCreating(false); load(); }}
        />
      )}
    </div>
  );
}

function ProductForm({
  initial,
  onClose,
  onSaved,
}: {
  initial: Product | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(initial?.name || '');
  const [category, setCategory] = useState(initial?.category || '');
  const [price, setPrice] = useState(String(initial?.price ?? ''));
  const [stock, setStock] = useState(String(initial?.stock ?? 0));
  const [sku, setSku] = useState(initial?.sku || '');
  const [image, setImage] = useState<string | null>(initial?.image || null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);

  async function uploadFile(f: File) {
    const fd = new FormData();
    fd.append('file', f);
    const r = await fetch('/api/upload', { method: 'POST', body: fd });
    if (r.ok) {
      const d = await r.json();
      setImage(d.url);
    } else {
      alert('อัพโหลดไม่สำเร็จ');
    }
  }

  async function save() {
    setSaving(true);
    const payload = { name, category: category || null, price: Number(price), stock: Number(stock), sku: sku || null, image };
    const r = initial
      ? await fetch(`/api/products/${initial.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
      : await fetch('/api/products', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    setSaving(false);
    if (r.ok) onSaved();
    else alert('บันทึกไม่สำเร็จ');
  }

  async function remove() {
    if (!initial) return;
    if (!confirm('ลบสินค้านี้?')) return;
    await fetch(`/api/products/${initial.id}`, { method: 'DELETE' });
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white">
          <div className="font-semibold text-lg">{initial ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}</div>
          <button onClick={onClose} className="text-2xl leading-none text-slate-400">×</button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <div className="aspect-square w-40 mx-auto bg-slate-100 rounded-2xl overflow-hidden grid place-items-center">
              {image ? (
                <img src={image} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-slate-300 text-5xl">📷</span>
              )}
            </div>
            <div className="flex justify-center gap-2 mt-3">
              <button type="button" onClick={() => camRef.current?.click()} className="btn-ghost text-sm">📸 ถ่ายรูป</button>
              <button type="button" onClick={() => fileRef.current?.click()} className="btn-ghost text-sm">🖼️ จากเครื่อง</button>
              {image && (
                <button type="button" onClick={() => setImage(null)} className="btn-ghost text-sm text-rose-500">ลบรูป</button>
              )}
            </div>
            <input
              ref={camRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])}
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])}
            />
          </div>

          <div>
            <label className="label">ชื่อสินค้า</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">ราคา (บาท)</label>
              <input className="input" type="number" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div>
              <label className="label">สต๊อก</label>
              <input className="input" type="number" inputMode="numeric" value={stock} onChange={(e) => setStock(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">หมวดหมู่</label>
              <input className="input" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="เช่น เครื่องดื่ม" />
            </div>
            <div>
              <label className="label">รหัส SKU</label>
              <input className="input" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="ไม่บังคับ" />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            {initial && (
              <button onClick={remove} className="btn-danger">ลบ</button>
            )}
            <button onClick={save} disabled={saving || !name || !price} className="btn-primary flex-1 disabled:opacity-50">
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
