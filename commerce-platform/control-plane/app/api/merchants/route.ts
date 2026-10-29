import { randomUUID } from 'node:crypto';
import { and, eq, sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { merchantProvisions, teamMembers, teams } from '@/lib/db/schema';
import {
  normalizeShopSlug, normalizeShopName,
  previewProvisioningEnabled, syncMerchantToEdge
} from '@/lib/commerce/provisioning';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const headers = { 'Cache-Control': 'private, no-store' };
function reply(body: unknown, status: number) {
  return NextResponse.json(body, { status, headers });
}
async function teamContext() {
  const user = await getUser();
  if (!user) return null;
  // getTeamForUser() rejects ambiguous multi-team ownership.
  const team = await getTeamForUser();
  if (!team) return { user, team: null, role: null };
  const role = await db.select({ role: teamMembers.role }).from(teamMembers)
    .where(and(eq(teamMembers.teamId, team.id), eq(teamMembers.userId, user.id))).limit(1);
  return { user, team, role: role[0]?.role ?? null };
}
function view(row: typeof merchantProvisions.$inferSelect) {
  return { id: row.id, slug: row.slug, displayName: row.displayName,
    state: row.state, edgeSynced: row.edgeSyncedAt !== null,
    attempts: row.attempts, backendConnected: false };
}
export async function GET() {
  const ctx = await teamContext();
  if (!ctx) return reply({ error: 'authentication_required' }, 401);
  if (!ctx.team) return reply({ error: 'team_not_selected' }, 409);
  const [existing] = await db.select().from(merchantProvisions)
    .where(eq(merchantProvisions.teamId, ctx.team.id)).limit(1);
  return reply({ merchant: existing ? view(existing) : null }, 200);
}

export async function POST(request: NextRequest) {
  if (!previewProvisioningEnabled()) return reply({ error: 'preview_provisioning_disabled' }, 503);
  const ctx = await teamContext();
  if (!ctx) return reply({ error: 'authentication_required' }, 401);
  if (!ctx.team) return reply({ error: 'team_not_selected' }, 409);
  if (ctx.role !== 'owner') return reply({ error: 'owner_required' }, 403);
  // Browser-side CSRF protection in addition to SameSite cookies.
  const origin = request.headers.get('origin');
  if (!origin || origin !== request.nextUrl.origin) {
    return reply({ error: 'same_origin_required' }, 403);
  }
  const length = Number(request.headers.get('content-length') ?? 0);
  if (length > 4096) return reply({ error: 'payload_too_large' }, 413);
  let body: { slug?: unknown; displayName?: unknown };
  try { body = await request.json(); } catch { return reply({ error: 'invalid_json' }, 400); }
  const slug = normalizeShopSlug(body?.slug);
  const name = normalizeShopName(body?.displayName);
  if (!slug || !name) return reply({ error: 'invalid_shop_details' }, 400);

  let merchant: typeof merchantProvisions.$inferSelect;
  try {
    merchant = await db.transaction(async tx => {
      await tx.execute(sql`SELECT id FROM teams WHERE id = ${ctx.team!.id} FOR UPDATE`);
      const [owner] = await tx.select({ role: teamMembers.role }).from(teamMembers)
        .where(and(eq(teamMembers.teamId, ctx.team!.id),
                   eq(teamMembers.userId, ctx.user.id))).limit(1);
      if (owner?.role !== 'owner') throw new Error('owner_revoked');
      const [existing] = await tx.select().from(merchantProvisions)
        .where(eq(merchantProvisions.teamId, ctx.team!.id)).limit(1);
      if (existing) {
        if (existing.slug !== slug || existing.displayName !== name) throw new Error('shop_already_exists');
        return existing;
      }
      const [created] = await tx.insert(merchantProvisions)
        .values({ id: randomUUID(), teamId: ctx.team!.id, slug, displayName: name })
        .returning();
      return created;
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'owner_revoked') return reply({ error: 'owner_required' }, 403);
    if (error instanceof Error && error.message === 'shop_already_exists') return reply({ error: 'shop_already_exists' }, 409);
    // Including UNIQUE(slug) violations: never disclose merchant ownership or SQL internals.
    return reply({ error: 'shop_unavailable_or_slug_reserved' }, 409);
  }

  const result = await syncMerchantToEdge(merchant);
  const [updated] = await db.select().from(merchantProvisions)
    .where(eq(merchantProvisions.id, merchant.id)).limit(1);
  // Always 202: no Medusa backend is hosted. D1 provisioning != accepting orders.
  return reply({ merchant: view(updated), sync: result, ready: false }, 202);
}
