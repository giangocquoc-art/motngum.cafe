'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';

type Merchant = {
  id: string;
  slug: string;
  displayName: string;
  state: string;
  edgeSynced: boolean;
  backendConnected: false;
  attempts: number;
};

export function CommerceSetup({ enabled, owner }: { enabled: boolean; owner: boolean }) {
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [slug, setSlug] = useState('');

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/merchants', { cache: 'no-store' });
      const data = await response.json();
      if (response.ok) setMerchant(data.merchant);
      else setMessage(data.error || 'Chưa thể đọc thông tin tổ chức.');
    } catch {
      setMessage('Không kết nối được hệ thống quản trị.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enabled || !owner || saving) return;
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch('/api/merchants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ slug, displayName })
      });
      const body = await response.json();
      if (!response.ok) {
        setMessage(body.error || 'Tạo cửa hàng chưa thành công.');
      } else {
        setMerchant(body.merchant);
        setMessage(body.sync?.synced
          ? 'Đã ghi nhận trên Cloudflare. Chưa thể bán hàng do Medusa chưa kết nối.'
          : 'Đã lưu vào PostgreSQL; đang chờ đồng bộ lại với Cloudflare.');
      }
    } catch {
      setMessage('Kết nối thất bại. Có thể gửi lại cùng thông tin để thử đồng bộ.');
    } finally {
      setSaving(false);
    }
  }

  const stateLabel: Record<string, string> = {
    requested: 'Đã ghi nhận yêu cầu',
    edge_pending: 'Đang chờ đồng bộ Edge',
    waiting_backend: 'Đã đồng bộ Edge, chờ Medusa',
    active: 'Đã kích hoạt',
    failed: 'Cần kiểm tra'
  };

  return (
    <section className="mx-auto max-w-4xl space-y-6 p-6 lg:p-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-700">Motngum Commerce · Preview</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Thiết lập cửa hàng</h1>
        <p className="mt-2 text-slate-600">Quản lý trạng thái tạo shop trên PostgreSQL và Cloudflare. Đây là staging, không nhận đơn hàng hoặc thanh toán.</p>
      </header>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Control Plane</p><strong className="text-slate-900">PostgreSQL</strong>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Đăng ký domain / tenant</p><strong className="text-slate-900">Cloudflare D1</strong>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Bán hàng / Checkout</p><strong className="text-amber-800">Chưa kết nối Medusa</strong>
        </div>
      </div>

      {loading ? <p role="status">Đang tải thông tin cửa hàng…</p> : merchant ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Cửa hàng của tổ chức</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">{merchant.displayName}</h2>
          <p className="mt-2 text-sm text-slate-600">Slug: <code>{merchant.slug}</code></p>
          <p className="mt-2 text-sm text-slate-600">Trạng thái: {stateLabel[merchant.state] || merchant.state}</p>
          <p className="mt-1 text-sm text-slate-600">D1: {merchant.edgeSynced ? 'Đã ghi nhận' : 'Chưa xác nhận đồng bộ'}</p>
          <p className="mt-1 text-sm text-slate-600">Medusa: Chưa có backend đang hoạt động</p>
          {enabled && owner && !merchant.edgeSynced && (
            <p className="mt-4 text-sm text-slate-700">Có thể gửi lại đúng slug/tên bằng API để đồng bộ idempotent; không đổi sang shop mới.</p>
          )}
        </div>
      ) : enabled && owner ? (
        <form onSubmit={submit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Đăng ký shop thử nghiệm</h2>
          <label className="block text-sm font-medium">Tên cửa hàng
            <input value={displayName} onChange={e => setDisplayName(e.target.value)} required minLength={2}
              maxLength={100} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2"/>
          </label>
          <label className="block text-sm font-medium">Đường dẫn slug (3–48 ký tự, a–z, 0–9, dấu -)
            <input value={slug} onChange={e => setSlug(e.target.value.toLowerCase())}
              required minLength={3} maxLength={48} pattern="[a-z0-9][a-z0-9-]{1,46}[a-z0-9]"
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2"/>
          </label>
          <button type="submit" disabled={saving} className="rounded-lg bg-slate-900 px-4 py-2 text-white disabled:opacity-50">
            {saving ? 'Đang ghi nhận…' : 'Tạo cửa hàng thử nghiệm'}
          </button>
        </form>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700">
          {owner ? 'Tạo shop hiện được khóa cho đến khi khóa bí mật giữa Vercel và Cloudflare được thiết lập, xác thực email và kiểm thử hoàn tất.'
                 : 'Chỉ owner của tổ chức mới được đăng ký cửa hàng.'}
        </div>
      )}
      {message && <p role="status" className="rounded-lg bg-slate-50 p-3 text-sm text-slate-800">{message}</p>}
    </section>
  );
}
