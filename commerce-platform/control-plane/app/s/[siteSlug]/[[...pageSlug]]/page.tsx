import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { eq, and, isNotNull } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { builderSites } from '@/lib/db/schema';
import { SiteRenderer } from '@/components/site-renderer';
import { validateSiteDocument } from '@/lib/builder/validation';

export const dynamic='force-dynamic';
export const runtime='nodejs';
type Params={params:Promise<{siteSlug:string;pageSlug?:string[]}>};
const findPublic = cache(async (siteSlug:string) => {
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(siteSlug)||siteSlug.length>80)return null;
  const [site]=await db.select({publishedDocument:builderSites.publishedDocument})
    .from(builderSites)
    .where(and(eq(builderSites.slug,siteSlug),isNotNull(builderSites.publishedAt))).limit(1);
  return site?validateSiteDocument(site.publishedDocument):null;
});
export async function generateMetadata({params}:Params):Promise<Metadata> {
  const {siteSlug,pageSlug}=await params;
  const doc=await findPublic(siteSlug);
  if(!doc || (pageSlug && pageSlug.length>1))notFound();
  const page=doc.pages.find(p=>p.slug===(pageSlug?.[0]||doc.pages[0].slug));
  if(!page)notFound();
  return {title:page.title+' | '+doc.title,
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
