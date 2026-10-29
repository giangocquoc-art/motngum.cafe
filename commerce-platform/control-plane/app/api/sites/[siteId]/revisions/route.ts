import { and, desc, eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { builderSiteRevisions, builderSites } from '@/lib/db/schema';
import { studioContext, siteIdValid } from '@/lib/builder/site-context';
import { studioReply } from '@/lib/builder/http';

export const dynamic='force-dynamic';
export const runtime='nodejs';
export async function GET(_:NextRequest,{params}:{params:Promise<{siteId:string}>}) {
  const ctx=await studioContext();
  if(ctx.status!==200 || !ctx.team)return studioReply({error:'authentication_or_team_required'},ctx.status);
  const {siteId}=await params;
  if(!siteIdValid(siteId))return studioReply({error:'not_found'},404);
  const [site]=await db.select({id:builderSites.id}).from(builderSites)
    .where(and(eq(builderSites.id,siteId),eq(builderSites.teamId,ctx.team.id))).limit(1);
  if(!site)return studioReply({error:'not_found'},404);
  const revisions=await db.select({
    version:builderSiteRevisions.version,action:builderSiteRevisions.action,
    createdAt:builderSiteRevisions.createdAt,actorId:builderSiteRevisions.actorId
  }).from(builderSiteRevisions)
    .where(and(eq(builderSiteRevisions.siteId,siteId),eq(builderSiteRevisions.teamId,ctx.team.id)))
    .orderBy(desc(builderSiteRevisions.version)).limit(40);
  return studioReply({revisions});
}
