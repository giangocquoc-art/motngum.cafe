import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { getUser } from '@/lib/db/queries';
import { teamMembers, teams } from '@/lib/db/schema';
import { getSession, setSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const noCache = { 'Cache-Control': 'private, no-store' };
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: noCache });

export async function GET() {
  const user = await getUser();
  if (!user) return json({ error: 'authentication_required' }, 401);
  const rows = await db.select({
    id: teams.id, name: teams.name, role: teamMembers.role
  }).from(teamMembers).innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(teamMembers.userId, user.id))
    .orderBy(teams.id).limit(50);
  const session = await getSession();
  return json({ teams: rows, activeTeamId: session?.activeTeamId ?? (rows.length === 1 ? rows[0].id : null) });
}

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) return json({ error: 'authentication_required' }, 401);
  const origin = request.headers.get('origin');
  if (!origin || origin !== request.nextUrl.origin) return json({ error: 'same_origin_required' }, 403);
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.startsWith('application/json')) return json({ error: 'json_required' }, 415);
  if (Number(request.headers.get('content-length') ?? 0) > 512) return json({ error: 'payload_too_large' }, 413);
  let teamId: unknown;
  try {
    const raw = await request.text();
    if (raw.length > 512) return json({ error: 'payload_too_large' }, 413);
    teamId = JSON.parse(raw)?.teamId;
  } catch { return json({ error: 'invalid_json' }, 400); }
  if (typeof teamId !== 'number' || !Number.isSafeInteger(teamId) || teamId <= 0)
    return json({ error: 'invalid_team_id' }, 400);
  const [member] = await db.select({ role: teamMembers.role }).from(teamMembers)
    .where(and(eq(teamMembers.userId, user.id), eq(teamMembers.teamId, teamId))).limit(1);
  if (!member) return json({ error: 'team_access_denied' }, 403);
  // Team ID is only embedded after server-side DB membership verification.
  await setSession(user, teamId);
  return json({ activeTeamId: teamId }, 200);
}
