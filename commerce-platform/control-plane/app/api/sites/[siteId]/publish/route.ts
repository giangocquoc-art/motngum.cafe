import { and, eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { builderSites } from '@/lib/db/schema';
import { studioContext, mayPublish, siteIdValid } from '@/lib/builder/site-context';
import { readStudioBody, studioReply } from '@/lib/builder/http';
import { publishIssues, validateSiteDocument } from '@/lib/builder/validation';

export const dynamic='force-dynamic';
export const runtime='nodejs';
type RouteProps={params:Promise<{siteId:string}>};

export async function POST(request:NextRequest,{params}:RouteProps) {
  const ctx=await studioContext();
  if(ctx.status!==200 || !ctx.team || !ctx.user)
    return studioReply({error:'authentication_or_team_required'},ctx.status);
  if(!mayPublish(ctx.role))return studioReply({error:'owner_required'},403);
  const {siteId}=await params;
  if(!siteIdValid(siteId))return studioReply({error:'not_found'},404);
  const input=await readStudioBody(request);
  if(input.error)return input.error;
  const data=input.body as Record<string,unknown>|null;
  if(typeof data?.version!=='number' || !Number.isSafeInteger(data.version) || data.version<1)
    return studioReply({error:'invalid_version'},422);
  const [site]=await db.select().from(builderSites)
    .where(and(eq(builderSites.id,siteId),eq(builderSites.teamId,ctx.team.id))).limit(1);
  if(!site)return studioReply({error:'not_found'},404);
  if(site.draftVersion!==data.version)return studioReply({error:'stale_document',latest:site.draftVersion},409);
  const document=validateSiteDocument(site.draftDocument);
  if(!document)return studioReply({error:'invalid_stored_document'},422);
  const problems=publishIssues(document);
  if(problems.length)return studioReply({error:'publish_validation_failed',problems},422);
  const [updated]=await db.update(builderSites)
    .set({publishedDocument:document,publishedVersion:site.draftVersion,publishedAt:new Date(),updatedAt:new Date()})
    .where(and(eq(builderSites.id,siteId),eq(builderSites.teamId,ctx.team.id),
      eq(builderSites.draftVersion,site.draftVersion))).returning({slug:builderSites.slug,version:builderSites.publishedVersion});
  if(!updated)return studioReply({error:'stale_document'},409);
  return studioReply({published:true,version:updated.version,url:'/s/'+updated.slug});
}
