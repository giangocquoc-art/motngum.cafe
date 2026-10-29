import { getTeamForUser, getUser } from '@/lib/db/queries';

export async function GET() {
  const user = await getUser();
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const team = await getTeamForUser();
  if (!team) return Response.json({ error: 'team_not_selected' }, { status: 409 });
  return Response.json(team, { headers: { 'Cache-Control': 'private, no-store' } });
}
