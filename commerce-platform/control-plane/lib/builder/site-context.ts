import { getUser, getTeamForUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { teamMembers } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

export async function studioContext() {
  const user = await getUser();
  if (!user) return {status:401 as const, user:null, team:null, role:null};
  const team = await getTeamForUser();
  if (!team) return {status:409 as const,user,team:null,role:null};
  const [member] = await db.select({ role:teamMembers.role }).from(teamMembers)
    .where(and(eq(teamMembers.teamId,team.id),eq(teamMembers.userId,user.id))).limit(1);
  if (!member) return {status:403 as const,user,team:null,role:null};
  return {status:200 as const,user,team,role:member.role};
}
export const mayEdit = (role:string|null) => role==='owner' || role==='member' || role==='editor';
export const mayPublish = (role:string|null) => role==='owner';
export const siteIdValid = (siteId:string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(siteId);
