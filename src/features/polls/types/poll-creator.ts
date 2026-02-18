export interface PollCreatorProps {
  onPollDataChange: (
    pollData: {
      question: string;
      options: string[];
      endsAt?: string;
    } | null
  ) => void;
}
