'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';

export function LogoutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/login');
        },
      },
    });
  };

  return (
    <Button variant="ghost" onClick={handleSignOut}>
      Sign Out
    </Button>
  );
}
