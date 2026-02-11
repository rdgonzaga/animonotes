'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PollOption {
  id: string;
  text: string;
  voteCount: number;
  percentage: number;
}

interface PollResults {
  id: string;
  question: string;
  endsAt: string | null;
  totalVotes: number;
  options: PollOption[];
}

interface PollResultsProps {
  pollId: string;
}

export function PollResults({ pollId }: PollResultsProps) {
  const [results, setResults] = useState<PollResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResults();
  }, [pollId]);

  const fetchResults = async () => {
    try {
      const response = await fetch(`/api/polls/${pollId}/results`);
      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Loading results...</div>
        </CardContent>
      </Card>
    );
  }

  if (error || !results) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-500 dark:text-red-400">
            {error || 'Failed to load results'}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{results.question}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {results.totalVotes} {results.totalVotes === 1 ? 'vote' : 'votes'}
        </p>
        {results.endsAt && (
          <p className="text-sm text-muted-foreground">
            {new Date(results.endsAt) < new Date()
              ? `Ended: ${new Date(results.endsAt).toLocaleString()}`
              : `Ends: ${new Date(results.endsAt).toLocaleString()}`}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {results.options.map((option) => (
          <div key={option.id} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{option.text}</span>
              <span className="text-muted-foreground">
                {option.voteCount} ({option.percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-accent h-full transition-all duration-300"
                style={{ width: `${option.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
