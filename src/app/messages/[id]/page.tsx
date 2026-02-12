'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageThread } from '@/features/messages/components/message-thread';
import { MessageInput } from '@/features/messages/components/message-input';
import { BlockUserButton } from '@/features/messages/components/block-user-button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface User {
  id: string;
  name: string | null;
  image: string | null;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: User;
}

interface Participant {
  userId: string;
  user: User;
}

interface Conversation {
  id: string;
  participants: Participant[];
  messages: Message[];
}

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const conversationId = params.id as string;

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user) {
      router.push('/login?callbackUrl=/messages');
      return;
    }
    fetchConversation();
  }, [status, session, conversationId]);

  const fetchConversation = async () => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Conversation not found');
        }
        if (response.status === 403) {
          throw new Error("You don't have access to this conversation");
        }
        throw new Error('Failed to fetch conversation');
      }
      const data = await response.json();
      setConversation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto w-full py-4 md:py-8 px-4">
        <div className="text-center py-16">Loading conversation...</div>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="max-w-6xl mx-auto w-full py-4 md:py-8 px-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-500 dark:text-red-400">
              {error || 'Conversation not found'}
            </div>
            <div className="text-center mt-4">
              <Link href="/messages">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Messages
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const otherParticipant = conversation.participants.find((p) => p.userId !== session?.user?.id);

  return (
    <div className="max-w-6xl mx-auto w-full py-4 md:py-8 px-4">
      <Card className="flex flex-col md:min-h-[calc(100vh-12rem)]">
        {/* Chat header */}
        <CardHeader className="border-b border-border shrink-0">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <Link href="/messages">
                <Button variant="ghost" size="icon" className="shrink-0">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              {otherParticipant && (
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={otherParticipant.user.image || undefined} />
                    <AvatarFallback>
                      {otherParticipant.user.name?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-lg">
                    {otherParticipant.user.name || 'Unknown User'}
                  </CardTitle>
                </div>
              )}
              {!otherParticipant && <CardTitle className="text-lg">Unknown User</CardTitle>}
            </div>
            {otherParticipant && (
              <BlockUserButton
                userId={otherParticipant.userId}
                userName={otherParticipant.user.name || 'this user'}
                onBlockChange={() => router.push('/messages')}
              />
            )}
          </div>
        </CardHeader>

        {/* Chat messages - scrollable */}
        <CardContent className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-h-[50vh] md:max-h-none md:h-full overflow-y-auto pr-1 md:pr-2">
            <MessageThread messages={conversation.messages} />
          </div>
        </CardContent>

        {/* Message input - pinned to bottom */}
        <div className="border-t border-border p-4 md:p-6 shrink-0">
          <MessageInput conversationId={conversationId} onMessageSent={fetchConversation} />
        </div>
      </Card>
    </div>
  );
}
