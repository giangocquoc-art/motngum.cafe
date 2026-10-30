import {and,desc,eq} from 'drizzle-orm';
import {NextRequest} from 'next/server';
import {db} from '@/lib/db/drizzle';
import {builderSites,siteSubmissions} from '@/lib/db/schema';
import {mayEdit,siteIdValid,studioContext} from '@/lib/builder/site-context';
import {studioReply} from '@/lib/builder/http';
export const dynamic='force-dynamic';
export const runtime='nodejs';
export async function GET(_:NextRequest,{params}:{params:Promise<{siteId:string}>}){
  const ctx=await studioContext();
  if(ctx.status!==200||!ctx.team||!mayEdit(ctx.role))
    return studioReply({error:'authentication_or_team_required'},ctx.status===200?403:ctx.status);
  const {siteId}=await params;
  if(!siteIdValid(siteId))return studioReply({error:'not_found'},404);
  const [site]=await db.select({id:builderSites.id}).from(builderSites)
    .where(and(eq(builderSites.id,siteId),eq(builderSites.teamId,ctx.team.id))).limit(1);
  if(!site)return studioReply({error:'not_found'},404);
  const items=await db.select({id:siteSubmissions.id,kind:siteSubmissions.kind,
    name:siteSubmissions.name,email:siteSubmissions.email,message:siteSubmissions.message,
    createdAt:siteSubmissions.createdAt}).from(siteSubmissions)
    .where(and(eq(siteSubmissions.siteId,siteId),eq(siteSubmissions.teamId,ctx.team.id)))
    .orderBy(desc(siteSubmissions.createdAt)).limit(50);
  return studioReply({submissions:items,limit:50});
}
