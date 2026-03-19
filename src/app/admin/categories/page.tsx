import { getServerSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { CategoryBuilder } from '@/features/admin/components/category-builder';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const session = await getServerSession();
  if (!session?.user) redirect('/login');
  const role = (session.user as Record<string, unknown>).role as string;
  if (role !== 'admin') redirect('/admin');
  return <CategoryBuilder />;
}
