import { getServerSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { ModerationQueue } from '@/features/admin/components/moderation-queue';

export const dynamic = 'force-dynamic';

export default async function AdminReportsPage() {
  const session = await getServerSession();
  if (!session?.user) redirect('/login');

  return <ModerationQueue />;
}
