import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/session';

export default async function ProfileSettingsPage() {
  const session = await getServerSession();

  if (!session?.user?.id) {
    redirect('/login');
  }

  redirect(`/profile/${session.user.id}`);
}
