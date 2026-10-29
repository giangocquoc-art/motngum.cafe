'use server';

import { z } from 'zod';
import { and, eq, sql, isNull } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  User,
  users,
  teams,
  teamMembers,
  activityLogs,
  type NewUser,
  type NewTeam,
  type NewTeamMember,
  type NewActivityLog,
  ActivityType,
  invitations
} from '@/lib/db/schema';
import { comparePasswords, hashPassword, setSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createCheckoutSession } from '@/lib/payments/stripe';
import { getUser, getUserWithTeam } from '@/lib/db/queries';
import {
  validatedAction,
  validatedActionWithUser
} from '@/lib/auth/middleware';

async function logActivity(
  teamId: number | null | undefined,
  userId: number,
  type: ActivityType,
  ipAddress?: string
) {
  if (teamId === null || teamId === undefined) {
    return;
  }
  const newActivity: NewActivityLog = {
    teamId,
    userId,
    action: type,
    ipAddress: ipAddress || ''
  };
  await db.insert(activityLogs).values(newActivity);
}

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100)
});

export const signIn = validatedAction(signInSchema, async (data, formData) => {
  const { password } = data;
  const email = data.email.trim().toLowerCase();

  const userWithTeam = await db
    .select({
      user: users,
      team: teams
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .leftJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(and(eq(users.email, email), isNull(users.deletedAt)))
    .limit(1);

  if (userWithTeam.length === 0) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
    };
  }

  const { user: foundUser, team: foundTeam } = userWithTeam[0];

  const isPasswordValid = await comparePasswords(
    password,
    foundUser.passwordHash
  );

  if (!isPasswordValid) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
    };
  }

  await Promise.all([
    setSession(foundUser),
    logActivity(foundTeam?.id, foundUser.id, ActivityType.SIGN_IN)
  ]);

  const redirectTo = formData.get('redirect') as string | null;
  if (redirectTo === 'checkout' && process.env.ENABLE_PLATFORM_BILLING === 'true') {
    const priceId = formData.get('priceId') as string;
    return createCheckoutSession({ team: foundTeam, priceId });
  }

  redirect('/dashboard');
});

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  inviteId: z.string().optional()
});

export const signUp = validatedAction(signUpSchema, async (data) => {
  // Public registration remains disabled until email verification, abuse limits and deployment gates pass.
  if (process.env.ENABLE_PREVIEW_SIGNUP !== 'true') {
    return { error: 'Registration is disabled for this integration preview.' };
  }
  const email = data.email.trim().toLowerCase();
  const { password, inviteId } = data;
  // Numeric, non-expiring upstream invitations are NOT valid invitations in this staging release.
  if (inviteId) {
    return { error: 'Invitation enrollment is temporarily disabled pending secure one-time tokens.' };
  }
  const passwordHash = await hashPassword(password);
  try {
    const createdUser = await db.transaction(async (tx) => {
      const [createdUser] = await tx.insert(users)
        .values({ email, passwordHash, role: 'owner' }).returning();
      if (!createdUser) throw new Error('Could not create user');
      const [createdTeam] = await tx.insert(teams)
        .values({ name: `${email}'s Team` }).returning();
      if (!createdTeam) throw new Error('Could not create team');
      await tx.insert(teamMembers).values({
        userId: createdUser.id, teamId: createdTeam.id, role: 'owner'
      });
      await tx.insert(activityLogs).values([
        { teamId: createdTeam.id, userId: createdUser.id, action: ActivityType.CREATE_TEAM },
        { teamId: createdTeam.id, userId: createdUser.id, action: ActivityType.SIGN_UP }
      ]);
      return createdUser;
    });
    // The session must not be issued before the transaction commits.
    await setSession(createdUser);
  } catch {
    return { error: 'Could not create this account. Please verify the email is not already registered.' };
  }
  redirect('/dashboard');
});

export async function signOut() {
  const user = await getUser();
  if (!user) return;
  const userWithTeam = await getUserWithTeam(user.id);
  await logActivity(userWithTeam?.teamId, user.id, ActivityType.SIGN_OUT);
  (await cookies()).delete('session');
}

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(100),
  newPassword: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100)
});

export const updatePassword = validatedActionWithUser(
  updatePasswordSchema,
  async (data, _, user) => {
    const { currentPassword, newPassword, confirmPassword } = data;

    const isPasswordValid = await comparePasswords(
      currentPassword,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'Current password is incorrect.'
      };
    }

    if (currentPassword === newPassword) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'New password must be different from the current password.'
      };
    }

    if (confirmPassword !== newPassword) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'New password and confirmation password do not match.'
      };
    }

    const newPasswordHash = await hashPassword(newPassword);
    const userWithTeam = await getUserWithTeam(user.id);

    await Promise.all([
      db
        .update(users)
        .set({ passwordHash: newPasswordHash })
        .where(eq(users.id, user.id)),
      logActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_PASSWORD)
    ]);

    return {
      success: 'Password updated successfully.'
    };
  }
);

const deleteAccountSchema = z.object({
  password: z.string().min(8).max(100)
});

export const deleteAccount = validatedActionWithUser(
  deleteAccountSchema,
  async (data, _, user) => {
    const { password } = data;

    const isPasswordValid = await comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) {
      return { error: 'Incorrect password. Account deletion failed.' };
    }

    const userWithTeam = await getUserWithTeam(user.id);

    await logActivity(
      userWithTeam?.teamId,
      user.id,
      ActivityType.DELETE_ACCOUNT
    );

    // Soft delete
    await db
      .update(users)
      .set({
        deletedAt: sql`CURRENT_TIMESTAMP`,
        email: sql`CONCAT(email, '-', id, '-deleted')` // Ensure email uniqueness
      })
      .where(eq(users.id, user.id));

    if (userWithTeam?.teamId) {
      await db
        .delete(teamMembers)
        .where(
          and(
            eq(teamMembers.userId, user.id),
            eq(teamMembers.teamId, userWithTeam.teamId)
          )
        );
    }

    (await cookies()).delete('session');
    redirect('/sign-in');
  }
);

const updateAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address')
});

export const updateAccount = validatedActionWithUser(
  updateAccountSchema,
  async (data, _, user) => {
    const { name, email } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    await Promise.all([
      db.update(users).set({ name, email }).where(eq(users.id, user.id)),
      logActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_ACCOUNT)
    ]);

    return { name, success: 'Account updated successfully.' };
  }
);

const removeTeamMemberSchema = z.object({
  memberId: z.coerce.number().int().positive()
});

export const removeTeamMember = validatedActionWithUser(
  removeTeamMemberSchema,
  async (data, _, user) => {
    const currentMembership = await getUserWithTeam(user.id);
    if (!currentMembership?.teamId) return { error: 'No active team' };
    const teamId = currentMembership.teamId;
    const actor = await db.select({ role: teamMembers.role }).from(teamMembers)
      .where(and(eq(teamMembers.userId, user.id), eq(teamMembers.teamId, teamId))).limit(1);
    if (actor[0]?.role !== 'owner') return { error: 'Only team owners can manage membership.' };

    // Serialize removal against all membership changes using a row lock.
    return await db.transaction(async (tx) => {
      await tx.execute(sql`SELECT id FROM teams WHERE id = ${teamId} FOR UPDATE`);
      const target = await tx.select({ role: teamMembers.role }).from(teamMembers)
        .where(and(eq(teamMembers.id, data.memberId), eq(teamMembers.teamId, teamId))).limit(1);
      if (!target[0]) return { error: 'Member not found in your team.' };
      if (target[0].role === 'owner') {
        const [owners] = await tx.select({ count: sql<number>`count(*)::integer` })
          .from(teamMembers)
          .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.role, 'owner')));
        if ((owners?.count ?? 0) <= 1) return { error: 'Cannot remove the last team owner.' };
      }
      await tx.delete(teamMembers)
        .where(and(eq(teamMembers.id, data.memberId), eq(teamMembers.teamId, teamId)));
      await tx.insert(activityLogs).values({ teamId, userId: user.id, action: ActivityType.REMOVE_TEAM_MEMBER });
      return { success: 'Team member removed successfully' };
    });
  }
);

const inviteTeamMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['member', 'owner'])
});

export const inviteTeamMember = validatedActionWithUser(
  inviteTeamMemberSchema,
  async (_data, _, user) => {
    const member = await getUserWithTeam(user.id);
    if (!member?.teamId) return { error: 'No active team' };
    const actor = await db.select({ role: teamMembers.role }).from(teamMembers)
      .where(and(eq(teamMembers.userId, user.id), eq(teamMembers.teamId, member.teamId))).limit(1);
    if (actor[0]?.role !== 'owner') return { error: 'Only team owners can invite members.' };
    // Upstream has guessable numeric invitation IDs and a TODO email sender.
    // Do not falsely claim invitations were sent.
    return { error: 'Invitations are disabled until secure expiring tokens and email delivery are implemented.' };
  }
);
