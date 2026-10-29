import { desc, and, eq, isNull } from 'drizzle-orm';
import { db } from './drizzle';
import { activityLogs, teamMembers, teams, users } from './schema';
import { cookies } from 'next/headers';
import { verifyToken, getSession } from '@/lib/auth/session';

export async function getUser() {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  let sessionData;
  try {
    sessionData = await verifyToken(sessionCookie.value);
  } catch {
    return null;
  }
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== 'number'
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1);

  if (user.length === 0 || user[0].sessionVersion !== sessionData.version) {
    return null;
  }

  return user[0];
}

export async function getTeamByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  await db
    .update(teams)
    .set({
      ...subscriptionData,
      updatedAt: new Date()
    })
    .where(eq(teams.id, teamId));
}

export async function getUserWithTeam(userId: number) {
  const session = await getSession();
  if (!session || session.user.id !== userId) return null;
  const selected = await resolveSelectedTeamId(userId, session.activeTeamId);
  if (!selected) return null;
  const [member] = await db.select({ user: users, teamId: teamMembers.teamId })
    .from(users).innerJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(and(eq(users.id, userId), eq(teamMembers.teamId, selected))).limit(1);
  return member ?? null;
}

/** No arbitrary first-team fallback: signed activeTeamId must still be a real membership. */
async function resolveSelectedTeamId(userId: number, activeTeamId?: number): Promise<number | null> {
  if (activeTeamId !== undefined) {
    const [member] = await db.select({ id: teamMembers.teamId }).from(teamMembers)
      .where(and(eq(teamMembers.userId, userId), eq(teamMembers.teamId, activeTeamId))).limit(1);
    return member?.id ?? null;
  }
  const memberships = await db.select({ id: teamMembers.teamId }).from(teamMembers)
    .where(eq(teamMembers.userId, userId)).limit(2);
  return memberships.length === 1 ? memberships[0].id : null;
}

export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

export async function getTeamForUser() {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const session = await getSession();
  if (!session || session.user.id !== user.id) return null;
  const selectedTeamId = await resolveSelectedTeamId(user.id, session.activeTeamId);
  if (!selectedTeamId) return null;
  const result = await db.query.teamMembers.findFirst({
    where: and(eq(teamMembers.userId, user.id), eq(teamMembers.teamId, selectedTeamId)),
    with: {
      team: {
        with: {
          teamMembers: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }
    }
  });

  return result?.team || null;
}
