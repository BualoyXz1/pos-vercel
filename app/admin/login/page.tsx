'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr('');
    const r = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    });
    setLoading(false);
    if (!r.ok) {
      setErr('รหัสผ่านไม่ถูกต้อง');
      return;
    }
    router.push('/admin');
    router.refresh();
  }

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <form onSubmit={submit} className="card p-6 w-full max-w-sm space-y-4">
        <div className="text-center">
          <div className="text-3xl">🔒</div>
          <div className="text-xl font-bold mt-2">เข้าสู่ระบบผู้ดูแล</div>
        </div>
        <div>
          <label className="label">รหัสผ่าน</label>
          <input
            type="password"
            className="input"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoFocus
          />
        </div>
        {err && <div className="text-rose-500 text-sm">{err}</div>}
        <button disabled={loading} className="btn-primary w-full">
          {loading ? '...' : 'เข้าสู่ระบบ'}
        </button>
      </form>
    </div>
  );
}
