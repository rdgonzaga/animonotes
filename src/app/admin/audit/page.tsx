import { getServerSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { AuditLogViewer } from '@/features/admin/components/audit-log-viewer';

export const dynamic = 'force-dynamic';

export default async function AdminAuditPage() {
  const session = await getServerSession();
  if (!session?.user) redirect('/login');
  return <AuditLogViewer />;
}
