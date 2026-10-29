import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

/** Staging infrastructure health, NOT merchant commerce readiness. */
export async function GET() {
  let postgres = false;
  let cloudflareEdge = false;
  try {
    if (process.env.POSTGRES_URL) {
      const { db } = await import('@/lib/db/drizzle');
      await db.execute(sql`SELECT 1`);
      postgres = true;
    }
  } catch {
    postgres = false;
  }
  try {
    const r = await fetch('https://commerce-preview.motngum.cafe/health', {
      cache: 'no-store', signal: AbortSignal.timeout(6000)
    });
    if (r.ok) {
      const j = await r.json();
      cloudflareEdge = j.ok === true && j.layer === 'edge_registry';
    }
  } catch {
    cloudflareEdge = false;
  }
  const infrastructureOk = postgres && cloudflareEdge;
  return NextResponse.json({
    service: 'motngum-commerce-saas-staging',
    infrastructureOk,
    postgres: postgres ? 'connected' : 'unavailable',
    edge: cloudflareEdge ? 'connected' : 'unavailable',
    commerceReady: false,
    note: 'Medusa backend and merchant checkout not yet connected'
  }, { status: infrastructureOk ? 200 : 503, headers: { 'Cache-Control': 'no-store' } });
}
