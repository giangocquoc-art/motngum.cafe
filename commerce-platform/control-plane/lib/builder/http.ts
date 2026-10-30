import { sameOriginRequest } from '@/lib/auth/origin';
import { NextResponse, type NextRequest } from 'next/server';
import { MAX_SITE_PAYLOAD } from './validation';

export const studioReply = (value:unknown,status=200) =>
  NextResponse.json(value,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
export async function readStudioBody(request:NextRequest): Promise<{body:unknown,error:null}|{body:null,error:Response}> {
  if(!sameOriginRequest(request))return {body:null,error:studioReply({error:'same_origin_required'},403)};
  if(!(request.headers.get('content-type')||'').startsWith('application/json'))
    return {body:null,error:studioReply({error:'json_required'},415)};
  if(Number(request.headers.get('content-length')||0)>MAX_SITE_PAYLOAD)
    return {body:null,error:studioReply({error:'payload_too_large'},413)};
  try {
    const text=await request.text();
    if(text.length>MAX_SITE_PAYLOAD)return {body:null,error:studioReply({error:'payload_too_large'},413)};
    return {body:JSON.parse(text),error:null};
  }catch {return {body:null,error:studioReply({error:'invalid_json'},400)};}
}
