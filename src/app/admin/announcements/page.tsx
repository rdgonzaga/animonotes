import { getServerSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { AnnouncementsManager } from '@/features/admin/components/announcements-manager';

export const dynamic = 'force-dynamic';

export default async function AdminAnnouncementsPage() {
  const session = await getServerSession();
  if (!session?.user) redirect('/login');
  const role = (session.user as Record<string, unknown>).role as string;
  if (role !== 'admin') redirect('/admin');
  return <AnnouncementsManager />;
}
