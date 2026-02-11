"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageThread } from "@/components/messages/message-thread";
import { MessageInput } from "@/components/messages/message-input";
import { BlockUserButton } from "@/components/messages/block-user-button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

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
  const { data: session } = useSession();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const conversationId = params.id as string;

  useEffect(() => {
    if (!session?.user) {
      router.push("/login?callbackUrl=/messages");
      return;
    }
    fetchConversation();
  }, [session, conversationId]);

  const fetchConversation = async () => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Conversation not found");
        }
        if (response.status === 403) {
          throw new Error("You don't have access to this conversation");
        }
        throw new Error("Failed to fetch conversation");
      }
      const data = await response.json();
      setConversation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="text-center">Loading conversation...</div>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-500">
              {error || "Conversation not found"}
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

  const otherParticipant = conversation.participants.find(
    (p) => p.userId !== session?.user?.id
  );

  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/messages">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <CardTitle>
                {otherParticipant?.user?.name || "Unknown User"}
              </CardTitle>
            </div>
            {otherParticipant && (
              <BlockUserButton
                userId={otherParticipant.userId}
                userName={otherParticipant.user.name || "this user"}
                onBlockChange={() => router.push("/messages")}
              />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="max-h-[500px] overflow-y-auto pr-4">
            <MessageThread messages={conversation.messages} />
          </div>
          <MessageInput
            conversationId={conversationId}
            onMessageSent={fetchConversation}
          />
        </CardContent>
      </Card>
    </div>
  );
}
