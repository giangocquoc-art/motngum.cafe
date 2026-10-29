import { redirect } from 'next/navigation';
import { studioContext } from '@/lib/builder/site-context';
import { SiteDashboard } from '@/components/site-dashboard';
export const dynamic='force-dynamic';
export default async function SitesPage() {
  const ctx=await studioContext();
  if(ctx.status===401)redirect('/sign-in');
  if(ctx.status!==200) return <div className="p-8"><h1 className="text-2xl font-bold">Website của tôi</h1>
    <p className="mt-4 text-sm">Vui lòng chọn một tổ chức đang hoạt động trước khi quản lý website.</p></div>;
  return <SiteDashboard/>;
}
