import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/session';

export default async function ProfileSettingsPage() {
  const session = await getServerSession();
  const sessionUser = session?.user as Record<string, unknown> | undefined;
  const sessionUsername = typeof sessionUser?.username === 'string' ? sessionUser.username : null;

  if (!session?.user?.id) {
    redirect('/login');
  }

  redirect(`/profile/${sessionUsername || session.user.id}`);
}
