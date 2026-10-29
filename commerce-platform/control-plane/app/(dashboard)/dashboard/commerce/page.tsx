import { getUser, getTeamForUser } from '@/lib/db/queries';
import { previewProvisioningEnabled } from '@/lib/commerce/provisioning';
import { redirect } from 'next/navigation';
import { CommerceSetup } from './setup';

export const dynamic = 'force-dynamic';

export default async function CommercePage() {
  const user = await getUser();
  if (!user) redirect('/sign-in');
  const team = await getTeamForUser();
  if (!team) {
    return <section className="p-8"><h1 className="text-2xl font-semibold">Cửa hàng</h1>
      <p className="mt-4 text-slate-600">Chưa xác định được tổ chức đang hoạt động. Việc chọn giữa nhiều tổ chức chưa được triển khai.</p></section>;
  }
  const isOwner = team.teamMembers.some(member => member.user.id === user.id && member.role === 'owner');
  return <CommerceSetup owner={isOwner} enabled={isOwner && previewProvisioningEnabled()} />;
}
