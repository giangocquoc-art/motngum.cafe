import { eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { merchantProvisions, type MerchantProvision } from '@/lib/db/schema';

const EDGE_ENDPOINT = 'https://commerce-preview.motngum.cafe/internal/merchants';

export const normalizeShopSlug = (raw: unknown) => {
  if (typeof raw !== 'string') return null;
  const slug = raw.trim().toLowerCase();
  return /^[a-z0-9](?:[a-z0-9-]{1,46})[a-z0-9]$/.test(slug) && !slug.includes('--') ? slug : null;
};

export const normalizeShopName = (raw: unknown) => {
  if (typeof raw !== 'string') return null;
  const name = raw.trim().replace(/\s+/g, ' ');
  return name.length >= 2 && name.length <= 100 ? name : null;
};

export const previewProvisioningEnabled = () =>
  process.env.ENABLE_MERCHANT_PREVIEW_PROVISIONING === 'true' &&
  typeof process.env.EDGE_PROVISIONING_TOKEN === 'string' &&
  process.env.EDGE_PROVISIONING_TOKEN.length >= 48;

/**
 * A D1 'provisioning' merchant is NOT a ready/verified shop.
 * The persistent Postgres record is a durable retry queue; POST with
 * the same merchant ID/slug must never create another D1 merchant.
 */
export async function syncMerchantToEdge(merchant: MerchantProvision) {
  if (!previewProvisioningEnabled()) return { synced: false, reason: 'disabled' } as const;
  let synced = false;
  try {
    const res = await fetch(EDGE_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.EDGE_PROVISIONING_TOKEN}`,
        'content-type': 'application/json',
        Accept: 'application/json'
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({
        id: merchant.id,
        slug: merchant.slug,
        display_name: merchant.displayName
      })
    });
    if (res.ok) {
      const body: unknown = await res.json();
      const remote = body as { merchant?: { id?: unknown; slug?: unknown; state?: unknown } };
      synced = remote?.merchant?.id === merchant.id &&
        remote?.merchant?.slug === merchant.slug &&
        remote?.merchant?.state === 'provisioning';
    }
  } catch {
    synced = false;
  }
  await db.update(merchantProvisions).set({
    state: synced ? 'waiting_backend' : 'edge_pending',
    edgeSyncedAt: synced ? new Date() : null,
    lastError: synced ? null : 'edge_sync_pending',
    attempts: sql`${merchantProvisions.attempts} + 1`,
    updatedAt: new Date()
  }).where(eq(merchantProvisions.id, merchant.id));
  return synced
    ? ({ synced: true, reason: 'backend_not_connected' } as const)
    : ({ synced: false, reason: 'edge_sync_pending' } as const);
}
