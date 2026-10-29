import { getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';

// The middleware verifies JWT signature only. This server boundary enforces
// DB-backed revocation before rendering any private dashboard contents.
export default async function AuthenticatedDashboard({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect('/sign-in');
  return <>{children}</>;
}
