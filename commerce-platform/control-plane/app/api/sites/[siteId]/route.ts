import { randomUUID } from 'node:crypto';
import { and, eq, sql } from 'drizzle-orm';
import { NextRequest } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { builderSites, builderSiteRevisions } from '@/lib/db/schema';
import { studioContext, mayEdit, siteIdValid } from '@/lib/builder/site-context';
import { readStudioBody, studioReply } from '@/lib/builder/http';
import { validateSiteDocument } from '@/lib/builder/validation';

export const dynamic='force-dynamic';
export const runtime='nodejs';
type RouteProps={params:Promise<{siteId:string}>};

export async function GET(_:NextRequest,{params}:RouteProps) {
  const ctx=await studioContext();
  if(ctx.status!==200 || !ctx.team)return studioReply({error:'authentication_or_team_required'},ctx.status);
  const {siteId}=await params;
  if(!siteIdValid(siteId))return studioReply({error:'not_found'},404);
  const [site]=await db.select().from(builderSites)
    .where(and(eq(builderSites.id,siteId),eq(builderSites.teamId,ctx.team.id))).limit(1);
  if(!site)return studioReply({error:'not_found'},404);
  return studioReply({site:{
    id:site.id,slug:site.slug,title:site.title,
    document:site.draftDocument,version:site.draftVersion,
    publishedVersion:site.publishedVersion,publishedAt:site.publishedAt
  }});
}

export async function PATCH(request:NextRequest,{params}:RouteProps) {
  const ctx=await studioContext();
  if(ctx.status!==200 || !ctx.team || !ctx.user)
    return studioReply({error:'authentication_or_team_required'},ctx.status);
  if(!mayEdit(ctx.role))return studioReply({error:'editor_role_required'},403);
  const {siteId}=await params;
  if(!siteIdValid(siteId))return studioReply({error:'not_found'},404);
  const input=await readStudioBody(request);
  if(input.error)return input.error;
  const value=input.body as Record<string,unknown>|null;
  const document=validateSiteDocument(value?.document);
  const version=value?.version;
  if(!document || !Number.isSafeInteger(version) || typeof version!=='number' || version<1)
    return studioReply({error:'invalid_version_or_document'},422);
  try {
    const result=await db.transaction(async tx=>{
      const [updated]=await tx.update(builderSites)
        .set({
          draftDocument:document,title:document.title,
          draftVersion:sql.raw('"draft_version" + 1'),updatedAt:new Date()
        })
        .where(and(eq(builderSites.id,siteId),eq(builderSites.teamId,ctx.team!.id),
          eq(builderSites.draftVersion,version))).returning({
            version:builderSites.draftVersion,slug:builderSites.slug,title:builderSites.title
          });
      if(!updated)return null;
      await tx.insert(builderSiteRevisions).values({
        id:randomUUID(),siteId,teamId:ctx.team!.id,actorId:ctx.user!.id,
        version:updated.version,document,action:'save'
      });
      return updated;
    });
    if(!result)return studioReply({error:'stale_document_or_not_found'},409);
    return studioReply({site:{id:siteId,...result},saved:true});
  } catch {
    return studioReply({error:'save_failed'},503);
  }
}
