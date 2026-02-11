"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";
import { useSSE } from "@/hooks/useSSE";

interface VoteButtonsProps {
  targetId: string;
  targetType: "post" | "comment";
  initialScore: number;
  initialUserVote?: number | null;
  postId?: string; // For SSE channel subscription
}

export function VoteButtons({ targetId, targetType, initialScore, initialUserVote, postId }: VoteButtonsProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState(initialUserVote || 0);
  const [loading, setLoading] = useState(false);

  // Determine the channel to subscribe to (use postId for both posts and comments)
  const channelId = postId || (targetType === "post" ? targetId : undefined);

  // Subscribe to real-time vote updates via SSE
  useSSE(
    'vote-update',
    (data) => {
      // Only update if this is for our target
      const voteData = data as { targetId: string; targetType: string; score: number; userId: string };
      if (voteData.targetId === targetId && voteData.targetType === targetType) {
        setScore(voteData.score);
      }
    },
    {
      channels: channelId ? [`post-${channelId}`] : [],
    }
  );

  const handleVote = async (value: 1 | -1) => {
    if (!session) {
      router.push("/login");
      return;
    }

    setLoading(true);

    try {
      const endpoint = targetType === "post" 
        ? `/api/posts/${targetId}/vote`
        : `/api/comments/${targetId}/vote`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });

      if (!response.ok) {
        throw new Error("Vote failed");
      }

      const data = await response.json();
      
      // Update local state (score will be updated via SSE for all users)
      if (data.value === 0) {
        // Vote removed
        setUserVote(0);
      } else {
        // New or changed vote
        setUserVote(value);
      }

      // Update score immediately from server response
      if (data.score !== undefined) {
        setScore(data.score);
      }

      setLoading(false);
    } catch (error) {
      console.error("Vote error:", error);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote(1)}
        disabled={loading}
        className={userVote === 1 ? "text-orange-500" : ""}
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
      <span className={`font-bold ${
        userVote === 1 ? "text-orange-500" : 
        userVote === -1 ? "text-blue-500" : 
        ""
      }`}>
        {score}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote(-1)}
        disabled={loading}
        className={userVote === -1 ? "text-blue-500" : ""}
      >
        <ArrowDown className="h-5 w-5" />
      </Button>
    </div>
  );
}
