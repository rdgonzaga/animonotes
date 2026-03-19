import { getServerSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { UserManagement } from '@/features/admin/components/user-management';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const session = await getServerSession();
  if (!session?.user) redirect('/login');
  const role = (session.user as Record<string, unknown>).role as string;
  if (role !== 'admin') redirect('/admin');

  return <UserManagement />;
}
