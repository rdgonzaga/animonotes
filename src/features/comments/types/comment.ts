export interface CommentBase {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    image: string | null;
    username?: string | null;
  } | null;
  score: number;
  parentId: string | null;
  _count: {
    replies: number;
  };
}

export interface CommentWithChildren extends CommentBase {
  children?: CommentWithChildren[];
}

export interface CommentThreadProps {
  comment: CommentBase;
  postId: string;
  depth?: number;
  onReply: (commentId: string, content: string) => Promise<void>;
  userVote?: number | null;
}

export interface CommentListProps {
  postId: string;
}
