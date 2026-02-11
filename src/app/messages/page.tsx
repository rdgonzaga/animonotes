import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { ConversationList } from '@/components/messages/conversation-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'Messages - Hase Forum',
  description: 'Your direct messages',
};

export default async function MessagesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/messages');
  }

  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading conversations...</div>}>
            <ConversationList currentUserId={session.user.id} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
