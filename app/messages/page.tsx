import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { ConversationList } from '@/components/messages/conversation-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

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
    <div className="max-w-6xl mx-auto w-full py-4 md:py-8 px-4">
      <div className="flex flex-col md:flex-row gap-6 md:min-h-[calc(100vh-12rem)]">
        {/* Conversation list panel */}
        <div className="w-full md:w-[360px] lg:w-[400px] md:shrink-0">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading conversations...</div>}>
                <ConversationList currentUserId={session.user.id} />
              </Suspense>
            </CardContent>
          </Card>
        </div>

        {/* Placeholder panel for desktop - shown when no conversation selected */}
        <div className="hidden md:flex flex-1 items-center justify-center">
          <Card className="w-full h-full flex items-center justify-center min-h-[400px]">
            <CardContent className="text-center py-16">
              <MessageSquare className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">Select a conversation</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Choose a conversation from the left to start messaging
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
