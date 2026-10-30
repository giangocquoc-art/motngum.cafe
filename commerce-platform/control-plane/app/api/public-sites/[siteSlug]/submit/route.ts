import {randomUUID} from 'node:crypto';
import {and, eq, gte, isNotNull, sql} from 'drizzle-orm';
import {NextRequest} from 'next/server';
import {db} from '@/lib/db/drizzle';
import {builderSites,siteSubmissions} from '@/lib/db/schema';
import {sameOriginRequest} from '@/lib/auth/origin';
import {studioReply} from '@/lib/builder/http';
import {validateSiteDocument} from '@/lib/builder/validation';

export const dynamic='force-dynamic';
export const runtime='nodejs';
type Props={params:Promise<{siteSlug:string}>};
type RequestData=Record<string,unknown>;
const emailValid=(value:string)=>value.length<=254&&/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value);
export async function POST(request:NextRequest,{params}:Props){
  if(!sameOriginRequest(request))return studioReply({error:'same_origin_required'},403);
  if(!(request.headers.get('content-type')||'').startsWith('application/json'))
    return studioReply({error:'json_required'},415);
  const {siteSlug}=await params;
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(siteSlug)||siteSlug.length>80)
    return studioReply({error:'not_found'},404);
  if(Number(request.headers.get('content-length')||0)>8192)
    return studioReply({error:'payload_too_large'},413);
  let body:RequestData;
  try{
    const raw=await request.text();
    if(raw.length>8192)return studioReply({error:'payload_too_large'},413);
    const parsed=JSON.parse(raw);
    if(!parsed||Array.isArray(parsed)||typeof parsed!=='object')
      return studioReply({error:'invalid_form'},422);
    body=parsed as RequestData;
  }catch{return studioReply({error:'invalid_json'},400);}
  if(body.website) return studioReply({submitted:true},202); // quiet honeypot
  if(Object.keys(body).some(k=>!['requestId','blockId','name','email','message','website','consent'].includes(k)))
    return studioReply({error:'unknown_form_fields'},422);
  if(typeof body.requestId!=='string'||!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(body.requestId)||
     typeof body.blockId!=='string'||body.blockId.length>100||
     typeof body.email!=='string'||!emailValid(body.email.trim())||body.consent!==true||
     (body.name!==undefined&&(typeof body.name!=='string'||body.name.length>100))||
     (body.message!==undefined&&(typeof body.message!=='string'||body.message.length>2000)))
    return studioReply({error:'invalid_form'},422);
  try{
    return await db.transaction(async tx=>{
      const [site]=await tx.select({id:builderSites.id,teamId:builderSites.teamId,
        document:builderSites.publishedDocument}).from(builderSites)
        .where(and(eq(builderSites.slug,siteSlug),isNotNull(builderSites.publishedAt))).limit(1);
      if(!site)return studioReply({error:'not_found'},404);
      // Lock the published site row: rate limit and insertion are atomic across instances.
      await tx.execute(sql`SELECT id FROM builder_sites WHERE id=${site.id} FOR UPDATE`);
      const doc=validateSiteDocument(site.document);
      const block=doc?.pages.flatMap(page=>page.blocks).find(b=>b.id===body.blockId);
      if(!block||!['contact','newsletter'].includes(block.kind))
        return studioReply({error:'form_not_found'},404);
      if(block.kind==='contact' &&
         (typeof body.name!=='string'||!body.name.trim()||
          typeof body.message!=='string'||!body.message.trim()))
        return studioReply({error:'name_and_message_required'},422);
      const [dup]=await tx.select({id:siteSubmissions.id}).from(siteSubmissions)
        .where(and(eq(siteSubmissions.siteId,site.id),eq(siteSubmissions.requestId,body.requestId as string))).limit(1);
      if(dup)return studioReply({submitted:true,duplicate:true},200);
      const [rate]=await tx.select({n:sql<number>`count(*)::int`}).from(siteSubmissions)
        .where(and(eq(siteSubmissions.siteId,site.id),
          gte(siteSubmissions.createdAt,new Date(Date.now()-60_000))));
      if(rate.n>=25)return studioReply({error:'rate_limited',retryAfterSeconds:60},429);
      await tx.insert(siteSubmissions).values({
        id:randomUUID(),requestId:body.requestId as string,
        siteId:site.id,teamId:site.teamId,blockId:body.blockId as string,
        kind:block.kind as 'contact'|'newsletter',
        name:typeof body.name==='string'?body.name.trim():null,
        email:(body.email as string).trim().toLowerCase(),
        message:typeof body.message==='string'?body.message.trim():null
      });
      return studioReply({submitted:true},201);
    });
  }catch{return studioReply({error:'submission_unavailable'},503);}
}
