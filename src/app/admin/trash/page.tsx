import { getServerSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { TrashBin } from '@/features/admin/components/trash-bin';

export const dynamic = 'force-dynamic';

export default async function AdminTrashPage() {
  const session = await getServerSession();
  if (!session?.user) redirect('/login');
  return <TrashBin />;
}
