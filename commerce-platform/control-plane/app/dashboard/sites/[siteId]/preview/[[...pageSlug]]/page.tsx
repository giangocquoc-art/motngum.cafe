import { and, eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/db/drizzle';
import { builderSites } from '@/lib/db/schema';
import { studioContext, siteIdValid } from '@/lib/builder/site-context';
import { validateSiteDocument } from '@/lib/builder/validation';
import { SiteRenderer } from '@/components/site-renderer';

export const dynamic='force-dynamic';
export const metadata={robots:{index:false,follow:false}};
type Params={params:Promise<{siteId:string;pageSlug?:string[]}>};
export default async function DraftPreview({params}:Params) {
  const ctx=await studioContext();
  if(ctx.status===401)redirect('/sign-in');
  if(ctx.status!==200||!ctx.team)notFound();
  const {siteId,pageSlug}=await params;
  if(!siteIdValid(siteId)||(pageSlug&&pageSlug.length>1))notFound();
  const [site]=await db.select().from(builderSites).where(and(
    eq(builderSites.id,siteId),eq(builderSites.teamId,ctx.team.id))).limit(1);
  if(!site)notFound();
  const doc=validateSiteDocument(site.draftDocument);
  if(!doc)notFound();
  const slug=pageSlug?.[0]||doc.pages[0].slug;
  if(!doc.pages.some(p=>p.slug===slug))notFound();
  return <div><div className="bg-amber-100 p-3 text-center text-sm font-semibold text-amber-950">
    Bản nháp riêng tư · Chưa xuất bản · <a className="underline" href={'/builder-demo?site='+site.id}>Quay lại chỉnh sửa</a>
  </div><SiteRenderer document={doc} base={'/dashboard/sites/'+site.id+'/preview'} pageSlug={slug}/></div>;
}
