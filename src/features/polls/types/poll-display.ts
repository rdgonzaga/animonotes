export interface PollOption {
  id: string;
  text: string;
  order: number;
}

export interface Poll {
  id: string;
  question: string;
  endsAt: string | null;
  options: PollOption[];
}

export interface PollDisplayProps {
  poll: Poll;
}
