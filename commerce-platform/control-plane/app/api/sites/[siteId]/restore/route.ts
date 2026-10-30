import { randomUUID } from 'node:crypto';
import { and, eq, sql } from 'drizzle-orm';
import { NextRequest } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { builderSites, builderSiteRevisions } from '@/lib/db/schema';
import { studioContext, mayPublish, siteIdValid } from '@/lib/builder/site-context';
import { readStudioBody, studioReply } from '@/lib/builder/http';
import { validateSiteDocument } from '@/lib/builder/validation';

export const dynamic='force-dynamic';
export const runtime='nodejs';
export async function POST(request:NextRequest,{params}:{params:Promise<{siteId:string}>}) {
  const ctx=await studioContext();
  if(ctx.status!==200||!ctx.team||!ctx.user)return studioReply({error:'authentication_or_team_required'},ctx.status);
  if(!mayPublish(ctx.role))return studioReply({error:'owner_required'},403);
  const {siteId}=await params;
  if(!siteIdValid(siteId))return studioReply({error:'not_found'},404);
  const input=await readStudioBody(request);
  if(input.error)return input.error;
  const body=input.body as Record<string,unknown>|null;
  if(typeof body?.version!=='number'||!Number.isSafeInteger(body.version)||body.version<1||
     typeof body?.expectedCurrentVersion!=='number'||!Number.isSafeInteger(body.expectedCurrentVersion)||body.expectedCurrentVersion<1)
    return studioReply({error:'invalid_revisions'},422);
  const [revision]=await db.select({document:builderSiteRevisions.document})
    .from(builderSiteRevisions).where(and(eq(builderSiteRevisions.siteId,siteId),
      eq(builderSiteRevisions.teamId,ctx.team.id),eq(builderSiteRevisions.version,body.version))).limit(1);
  if(!revision)return studioReply({error:'revision_not_found'},404);
  const document=validateSiteDocument(revision.document);
  if(!document)return studioReply({error:'invalid_revision_document'},422);
  try{
    const result=await db.transaction(async tx=>{
      const [row]=await tx.update(builderSites)
        .set({draftDocument:document,title:document.title,draftVersion:sql.raw('"draft_version" + 1'),updatedAt:new Date()})
        .where(and(eq(builderSites.id,siteId),eq(builderSites.teamId,ctx.team!.id),
          eq(builderSites.draftVersion,body.expectedCurrentVersion as number)))
        .returning({version:builderSites.draftVersion});
      if(!row)return null;
      await tx.insert(builderSiteRevisions).values({
        id:randomUUID(),siteId,teamId:ctx.team!.id,actorId:ctx.user!.id,
        version:row.version,document,action:'restore'
      });
      return row;
    });
    if(!result)return studioReply({error:'stale_document_or_not_found'},409);
    return studioReply({restored:true,version:result.version});
  }catch{return studioReply({error:'restore_failed'},503);}
}
