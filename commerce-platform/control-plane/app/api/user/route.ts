import { getUser } from '@/lib/db/queries';

export async function GET() {
  const user = await getUser();
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
  // Explicit public profile projection: never serialize passwordHash, deletedAt or auth internals.
  const { id, name, email, role } = user;
  return Response.json({ id, name, email, role }, { headers: { 'Cache-Control': 'private, no-store' } });
}
