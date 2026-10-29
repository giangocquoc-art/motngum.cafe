/**
 * Explicit local-only seed. Upstream's public demo login and live Stripe
 * product-creation side effects are removed for multi-merchant SaaS safety.
 * NEVER use this against production. Merchant creation must be implemented
 * through verified authenticated onboarding workflows.
 */
import { eq } from 'drizzle-orm';
import { db } from './drizzle';
import { users, teams, teamMembers } from './schema';
import { hashPassword } from '@/lib/auth/session';

async function seed() {
  if (process.env.NODE_ENV === 'production' || process.env.ALLOW_LOCAL_SEED !== 'true') {
    throw new Error('Local demo seed disabled. This command must never create production accounts.');
  }
  const email = process.env.SEED_USER_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_USER_PASSWORD;
  if (!email || !email.includes('@') || !password || password.length < 16) {
    throw new Error('Set SEED_USER_EMAIL and strong SEED_USER_PASSWORD (>=16 chars) for local test only.');
  }
  const found = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (found.length) {
    console.log('Local seed user already exists; no changes made.');
    return;
  }
  const [user] = await db.insert(users).values({
    email, passwordHash: await hashPassword(password), role: 'owner'
  }).returning();
  const [team] = await db.insert(teams).values({ name: 'Local Development Team' }).returning();
  await db.insert(teamMembers).values({ teamId: team.id, userId: user.id, role: 'owner' });
  console.log('Created one local-only seed user. No Stripe products or payment credentials were created.');
}

seed().catch((error) => {
  console.error('Local seed failed:', error instanceof Error ? error.message : 'unknown');
  process.exitCode = 1;
});
