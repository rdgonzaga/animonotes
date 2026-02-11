"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { useSession } from "next-auth/react";

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

interface MessageThreadProps {
  messages: Message[];
}

export function MessageThread({ messages }: MessageThreadProps) {
  const { data: session } = useSession();

  if (messages.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No messages yet. Start the conversation!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const isOwnMessage = message.sender.id === session?.user?.id;

        return (
          <div
            key={message.id}
            className={`flex gap-3 ${isOwnMessage ? "flex-row-reverse" : ""}`}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={message.sender.image || undefined} />
              <AvatarFallback>
                {message.sender.name?.[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div
              className={`flex-1 max-w-[70%] ${isOwnMessage ? "items-end" : ""}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium">
                  {isOwnMessage ? "You" : message.sender.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(message.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <div
                className={`rounded-lg px-4 py-2 ${
                  isOwnMessage
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
