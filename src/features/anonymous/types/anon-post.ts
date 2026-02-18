export interface AnonPost {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  createdAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  _count: {
    comments: number;
    votes: number;
  };
  score: number;
}

export interface AnonPostCardProps {
  post: AnonPost;
}
