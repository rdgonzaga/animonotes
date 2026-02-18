export interface AnonCommentBase {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    image: string | null;
  } | null;
  isAnonymous: boolean;
  score: number;
  parentId: string | null;
  _count: {
    replies: number;
  };
}

export interface AnonCommentWithChildren extends AnonCommentBase {
  children?: AnonCommentWithChildren[];
}

export interface AnonCommentCardProps {
  comment: AnonCommentBase;
  postId: string;
  depth?: number;
  onReply: (commentId: string, content: string) => Promise<void>;
  userVote?: number | null;
}

export interface AnonCommentListProps {
  postId: string;
}
