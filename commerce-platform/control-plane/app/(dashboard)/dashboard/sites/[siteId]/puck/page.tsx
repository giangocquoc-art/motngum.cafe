import '@puckeditor/core/puck.css';
import { and, eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/db/drizzle';
import { builderSites } from '@/lib/db/schema';
import { mayEdit, siteIdValid, studioContext } from '@/lib/builder/site-context';
import { validateSiteDocument } from '@/lib/builder/validation';
import { StudioPuckClient } from '@/components/studio-puck-client';

export const dynamic='force-dynamic';
export const runtime='nodejs';
export const metadata={
  title:'Puck Studio | Motngum',
  robots:{index:false,follow:false},
};

export default async function PuckSiteEditor({params}:{
  params:Promise<{siteId:string}>;
}){
  const ctx=await studioContext();
  if(ctx.status===401)redirect('/sign-in');
  if(ctx.status!==200||!ctx.team||!mayEdit(ctx.role))notFound();
  const {siteId}=await params;
  if(!siteIdValid(siteId))notFound();
  const [site]=await db.select({
    id:builderSites.id,slug:builderSites.slug,
    draftDocument:builderSites.draftDocument,draftVersion:builderSites.draftVersion
  }).from(builderSites).where(and(
    eq(builderSites.id,siteId),eq(builderSites.teamId,ctx.team.id)
  )).limit(1);
  if(!site)notFound();
  const document=validateSiteDocument(site.draftDocument);
  if(!document)notFound();
  return <StudioPuckClient
    siteId={site.id}
    slug={site.slug}
    initialDocument={document}
    initialVersion={site.draftVersion}
    role={ctx.role||''}
  />;
}
