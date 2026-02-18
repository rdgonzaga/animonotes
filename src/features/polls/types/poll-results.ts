export interface PollOption {
  id: string;
  text: string;
  voteCount: number;
  percentage: number;
}

export interface PollResults {
  id: string;
  question: string;
  endsAt: string | null;
  totalVotes: number;
  options: PollOption[];
}

export interface PollResultsProps {
  pollId: string;
}
