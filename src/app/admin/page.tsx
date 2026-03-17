import { getServerSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { AdminOverview } from '@/features/admin/components/admin-overview';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await getServerSession();
  if (!session?.user) redirect('/login');
  return <AdminOverview />;
}
