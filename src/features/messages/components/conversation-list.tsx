'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

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
  createdAt: string;
  participants: Participant[];
  messages: Message[];
}

interface ConversationListProps {
  currentUserId: string;
}

export function ConversationList({ currentUserId }: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations');
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      const data = await response.json();
      setConversations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading conversations...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500 dark:text-red-400">Error: {error}</div>;
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No conversations yet. Start a conversation by visiting a user's profile.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => {
        const lastMessage = conversation.messages[0];
        const otherParticipant = conversation.participants.find((p) => p.userId !== currentUserId);

        return (
          <Link key={conversation.id} href={`/messages/${conversation.id}`}>
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer border border-transparent hover:border-border">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={otherParticipant?.user?.image || undefined} />
                <AvatarFallback>
                  {otherParticipant?.user?.name?.[0]?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <h3 className="font-semibold text-sm truncate">
                    {otherParticipant?.user?.name || 'Unknown User'}
                  </h3>
                  {lastMessage && (
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">
                      {formatDistanceToNow(new Date(lastMessage.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  )}
                </div>
                {lastMessage && (
                  <p className="text-xs text-muted-foreground truncate">
                    {lastMessage.sender.name}: {lastMessage.content}
                  </p>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
