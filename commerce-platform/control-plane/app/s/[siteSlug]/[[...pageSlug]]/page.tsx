import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { eq, and, isNotNull } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { builderSites } from '@/lib/db/schema';
import { SiteRenderer } from '@/components/site-renderer';
import { validateSiteDocument } from '@/lib/builder/validation';

export const dynamic='force-dynamic';
export const runtime='nodejs';
type Params={params:Promise<{siteSlug:string;pageSlug?:string[]}>};
async function findPublic(siteSlug:string) {
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(siteSlug)||siteSlug.length>80)return null;
  const [site]=await db.select({publishedDocument:builderSites.publishedDocument})
    .from(builderSites)
    .where(and(eq(builderSites.slug,siteSlug),isNotNull(builderSites.publishedAt))).limit(1);
  return site?validateSiteDocument(site.publishedDocument):null;
}
export async function generateMetadata({params}:Params):Promise<Metadata> {
  const {siteSlug,pageSlug}=await params;
  const doc=await findPublic(siteSlug);
  const page=doc?.pages.find(p=>p.slug===(pageSlug?.[0]||doc.pages[0].slug));
  return {title:page?page.title+' | '+doc!.title:'Website chưa được xuất bản',
    description:page?.blocks.find(b=>b.kind==='text'||b.kind==='hero')?.body.slice(0,150),
    robots:{index:false,follow:false}};
}
export default async function SitePage({params}:Params) {
  const {siteSlug,pageSlug}=await params;
  if(pageSlug&&pageSlug.length>1)notFound();
  const document=await findPublic(siteSlug);
  if(!document)notFound();
  const selected=pageSlug?.[0]||document.pages[0].slug;
  if(!document.pages.some(p=>p.slug===selected))notFound();
  return <SiteRenderer document={document} base={'/s/'+encodeURIComponent(siteSlug)} pageSlug={selected}/>;
}
