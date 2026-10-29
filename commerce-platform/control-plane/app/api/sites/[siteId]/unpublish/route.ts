import { and, eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { builderSites } from '@/lib/db/schema';
import { studioContext, mayPublish, siteIdValid } from '@/lib/builder/site-context';
import { readStudioBody, studioReply } from '@/lib/builder/http';

export const dynamic='force-dynamic';
export const runtime='nodejs';
export async function POST(request:NextRequest,{params}:{params:Promise<{siteId:string}>}) {
  const ctx=await studioContext();
  if(ctx.status!==200 || !ctx.team)return studioReply({error:'authentication_or_team_required'},ctx.status);
  if(!mayPublish(ctx.role))return studioReply({error:'owner_required'},403);
  const {siteId}=await params;
  if(!siteIdValid(siteId))return studioReply({error:'not_found'},404);
  const input=await readStudioBody(request);
  if(input.error)return input.error;
  const [result]=await db.update(builderSites)
    .set({publishedDocument:null,publishedVersion:null,publishedAt:null,updatedAt:new Date()})
    .where(and(eq(builderSites.id,siteId),eq(builderSites.teamId,ctx.team.id)))
    .returning({id:builderSites.id});
  if(!result)return studioReply({error:'not_found'},404);
  return studioReply({unpublished:true});
}
