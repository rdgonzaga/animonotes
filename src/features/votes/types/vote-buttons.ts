export interface VoteButtonsProps {
  targetId: string;
  targetType: 'post' | 'comment';
  initialScore: number;
  initialUserVote?: number | null;
  postId?: string;
}
