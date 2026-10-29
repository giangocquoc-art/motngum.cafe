import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/session';

/** Exact HTTP 404/503 before React streams HTML; never leak unpublished sites. */
async function publishedSiteGate(request:NextRequest) {
  const parts=request.nextUrl.pathname.split('/').filter(Boolean);
  if(parts.length<2 || parts.length>3)return new NextResponse('Not Found',{status:404});
  let slug:string,page:string|undefined;
  try {slug=decodeURIComponent(parts[1]);page=parts[2]?decodeURIComponent(parts[2]):undefined;}
  catch {return new NextResponse('Not Found',{status:404});}
  const valid=(v:string,max:number)=>v.length<=max && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v);
  if(!valid(slug,80)||(page&&!valid(page,60)))return new NextResponse('Not Found',{status:404});
  try {
    const {db}=await import('@/lib/db/drizzle');
    const {builderSites}=await import('@/lib/db/schema');
    const {eq,and,isNotNull}=await import('drizzle-orm');
    const {validateSiteDocument}=await import('@/lib/builder/validation');
    const [site]=await db.select({document:builderSites.publishedDocument}).from(builderSites)
      .where(and(eq(builderSites.slug,slug),isNotNull(builderSites.publishedAt))).limit(1);
    const doc=site?validateSiteDocument(site.document):null;
    if(!doc || (page&&!doc.pages.some(p=>p.slug===page)))
      return new NextResponse('Not Found',{status:404,headers:{'X-Robots-Tag':'noindex, nofollow'}});
    return NextResponse.next();
  }catch {
    return new NextResponse('Site preview unavailable',{status:503,headers:{'Cache-Control':'no-store'}});
  }
}
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/s/')) return publishedSiteGate(request);
  if (!pathname.startsWith('/dashboard')) return NextResponse.next();
  const token = request.cookies.get('session')?.value;
  if (!token) return NextResponse.redirect(new URL('/sign-in', request.url));
  try {
    await verifyToken(token);
    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL('/sign-in', request.url));
    response.cookies.delete('session');
    return response;
  }
}
export const config = { matcher: ['/dashboard/:path*','/s/:path*'], runtime: 'nodejs' };
