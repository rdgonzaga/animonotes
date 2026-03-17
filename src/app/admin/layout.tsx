import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/session';
import { AdminSidebar } from '@/features/admin/components/admin-sidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();

  if (!session?.user) {
    redirect('/login');
  }

  const role = (session.user as Record<string, unknown>).role as string;
  if (role !== 'admin' && role !== 'moderator') {
    redirect('/');
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-4 py-6">
      <div className="flex gap-6">
        <AdminSidebar userRole={role} />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
