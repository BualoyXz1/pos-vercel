'use client';
import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const [shopName, setShopName] = useState('');
  const [promptpay, setPromptpay] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/settings').then((r) => r.json()).then((s) => {
      setShopName(s.shop_name || '');
      setPromptpay(s.promptpay_id || '');
    });
  }, []);

  async function save() {
    setSaving(true);
    setMsg('');
    const r = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ shop_name: shopName, promptpay_id: promptpay.replace(/[^0-9]/g, '') }),
    });
    setSaving(false);
    setMsg(r.ok ? 'บันทึกแล้ว' : 'ผิดพลาด');
  }

  return (
    <div className="space-y-4 max-w-md">
      <h1 className="text-xl font-bold">ตั้งค่าระบบ</h1>
      <div className="card p-4 space-y-4">
        <div>
          <label className="label">ชื่อร้าน</label>
          <input className="input" value={shopName} onChange={(e) => setShopName(e.target.value)} />
        </div>
        <div>
          <label className="label">เบอร์พร้อมเพย์ / เลขบัตรประชาชน</label>
          <input
            className="input"
            value={promptpay}
            onChange={(e) => setPromptpay(e.target.value)}
            placeholder="08XXXXXXXX หรือ 13 หลัก"
          />
          <p className="text-xs text-slate-500 mt-1">ใช้สำหรับสร้าง QR Code ในหน้าชำระเงิน</p>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary w-full">
          {saving ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
        {msg && <div className="text-sm text-brand-700 text-center">{msg}</div>}
      </div>
    </div>
  );
}
