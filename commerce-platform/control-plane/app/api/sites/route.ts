import { randomUUID } from 'node:crypto';
import { desc, eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { builderSites, builderSiteRevisions } from '@/lib/db/schema';
import { studioContext, mayEdit } from '@/lib/builder/site-context';
import { readStudioBody, studioReply } from '@/lib/builder/http';
import { validateSiteDocument } from '@/lib/builder/validation';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const slugify = (value:string) => value.toLowerCase().normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/[^a-z0-9]+/g,'-')
  .replace(/^-+|-+$/g,'').slice(0,52).replace(/-+$/,'') || 'website';

export async function GET() {
  const ctx=await studioContext();
  if(ctx.status!==200 || !ctx.team)
    return studioReply({error:ctx.status===401?'authentication_required':'team_not_selected'},ctx.status);
  const rows=await db.select({
    id:builderSites.id,slug:builderSites.slug,title:builderSites.title,
    draftVersion:builderSites.draftVersion,publishedVersion:builderSites.publishedVersion,
    updatedAt:builderSites.updatedAt,publishedAt:builderSites.publishedAt
  }).from(builderSites).where(eq(builderSites.teamId,ctx.team.id))
    .orderBy(desc(builderSites.updatedAt)).limit(100);
  return studioReply({sites:rows,role:ctx.role});
}

export async function POST(request:NextRequest) {
  const ctx=await studioContext();
  if(ctx.status!==200 || !ctx.team || !ctx.user)
    return studioReply({error:ctx.status===401?'authentication_required':'team_not_selected'},ctx.status);
  if(!mayEdit(ctx.role))return studioReply({error:'editor_role_required'},403);
  const input=await readStudioBody(request);
  if(input.error)return input.error;
  const value=input.body as Record<string,unknown>|null;
  const document=validateSiteDocument(value?.document);
  if(!document)return studioReply({error:'invalid_site_document'},422);
  const id=randomUUID(),slug=slugify(document.title)+'-'+id.slice(0,8);
  try{
    await db.transaction(async tx=>{
      await tx.insert(builderSites).values({
        id,teamId:ctx.team!.id,createdBy:ctx.user!.id,
        slug,title:document.title,draftDocument:document,draftVersion:1
      });
      await tx.insert(builderSiteRevisions).values({
        id:randomUUID(),siteId:id,teamId:ctx.team!.id,actorId:ctx.user!.id,
        version:1,document,action:'create'
      });
    });
    return studioReply({site:{id,slug,version:1,title:document.title},ready:false},201);
  }catch{
    return studioReply({error:'site_creation_failed'},503);
  }
}
