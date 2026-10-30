import { and, eq, gte, sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { activityLogs } from '@/lib/db/schema';

type StudioRateAction='studio:create'|'studio:save';
/**
 * PostgreSQL-backed, concurrent-instance-safe quota. The team row is locked
 * before counting/writing usage, so parallel instances cannot bypass limits.
 * Attempts count even if a subsequent save conflicts; no raw IP is stored.
 */
export async function studioRateLimit(teamId:number,userId:number,action:StudioRateAction):Promise<boolean> {
  const perUser=action==='studio:create'?8:55;
  const perTeam=action==='studio:create'?18:180;
  return db.transaction(async tx=>{
    await tx.execute(sql`SELECT id FROM teams WHERE id = ${teamId} FOR UPDATE`);
    const cutoff=new Date(Date.now()-60_000);
    const [teamCount]=await tx.select({total:sql<number>`count(*)::int`})
      .from(activityLogs).where(and(eq(activityLogs.teamId,teamId),
        eq(activityLogs.action,action),gte(activityLogs.timestamp,cutoff)));
    const [userCount]=await tx.select({total:sql<number>`count(*)::int`})
      .from(activityLogs).where(and(eq(activityLogs.teamId,teamId),eq(activityLogs.userId,userId),
        eq(activityLogs.action,action),gte(activityLogs.timestamp,cutoff)));
    if(teamCount.total>=perTeam||userCount.total>=perUser)return false;
    await tx.insert(activityLogs).values({teamId,userId,action});
    return true;
  });
}
