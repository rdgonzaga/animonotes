export interface FeedPost {
  id: string;
  title: string;
  content: string;
  image?: string | null;
  createdAt: string | Date;
  score: number;
  author?: { id: string; name: string | null; image: string | null } | null;
  category?: { id: string; name: string; slug: string } | null;
  _count?: { comments: number; votes: number };
}

export interface FeedCategory {
  id: string;
  name: string;
  slug: string;
}

export type TabFilter = 'for-you' | 'trending' | 'by-category';

export interface FeedSectionProps {
  posts: FeedPost[];
  categories: FeedCategory[];
}
