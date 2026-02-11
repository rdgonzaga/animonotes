"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { PollResults } from "./poll-results";

interface PollOption {
  id: string;
  text: string;
  order: number;
}

interface Poll {
  id: string;
  question: string;
  endsAt: string | null;
  options: PollOption[];
}

interface PollDisplayProps {
  poll: Poll;
}

export function PollDisplay({ poll }: PollDisplayProps) {
  const { data: session } = useSession();
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  const isPollEnded = poll.endsAt && new Date(poll.endsAt) < new Date();

  useEffect(() => {
    // Check if user has voted
    checkVoteStatus();
  }, [poll.id, session]);

  const checkVoteStatus = async () => {
    if (!session?.user) return;

    try {
      const response = await fetch(`/api/polls/${poll.id}/results`);
      if (response.ok) {
        const data = await response.json();
        // If we can get results, check if user voted
        // This is a simplified check - in production you'd want a dedicated endpoint
        setShowResults(isPollEnded || false);
      }
    } catch (err) {
      console.error("Error checking vote status:", err);
    }
  };

  const handleVote = async () => {
    if (!selectedOption) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/polls/${poll.id}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ optionId: selectedOption }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to vote");
      }

      setHasVoted(true);
      setShowResults(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (showResults || hasVoted || isPollEnded) {
    return <PollResults pollId={poll.id} />;
  }

  if (!session?.user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{poll.question}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Please log in to vote on this poll.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{poll.question}</CardTitle>
        {poll.endsAt && (
          <p className="text-sm text-muted-foreground">
            Ends: {new Date(poll.endsAt).toLocaleString()}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded">
            {error}
          </div>
        )}
        
        <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
          {poll.options.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <RadioGroupItem value={option.id} id={option.id} />
              <Label htmlFor={option.id} className="cursor-pointer">
                {option.text}
              </Label>
            </div>
          ))}
        </RadioGroup>

        <Button
          onClick={handleVote}
          disabled={!selectedOption || loading}
          className="w-full"
        >
          {loading ? "Voting..." : "Vote"}
        </Button>
      </CardContent>
    </Card>
  );
}
