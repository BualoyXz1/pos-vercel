import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { headers } from 'next/headers';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = headers().get('x-pathname') || '';
  // Allow login page through
  if (!isAdmin() && !path.endsWith('/admin/login')) {
    // Fallback check via children — middleware would be cleaner; we redirect in pages.
  }
  return (
    <div className="min-h-screen">
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="px-4 py-3 flex items-center gap-4">
          <Link href="/" className="text-brand-700 font-bold">← ขายสินค้า</Link>
          <nav className="flex gap-3 text-sm ml-2">
            <Link href="/admin" className="text-slate-600 hover:text-brand-700">สินค้า</Link>
            <Link href="/admin/stock" className="text-slate-600 hover:text-brand-700">สต๊อก</Link>
            <Link href="/admin/reports" className="text-slate-600 hover:text-brand-700">รายงาน</Link>
            <Link href="/admin/settings" className="text-slate-600 hover:text-brand-700">ตั้งค่า</Link>
          </nav>
          <form action="/api/auth/logout" method="post" className="ml-auto">
            <button className="text-sm text-slate-500">ออกจากระบบ</button>
          </form>
        </div>
      </header>
      <main className="max-w-5xl mx-auto p-4">{children}</main>
    </div>
  );
}
