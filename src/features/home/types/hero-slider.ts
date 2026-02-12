export interface FeaturedPost {
  id: string;
  title: string;
  content: string;
  image?: string | null;
  author?: { id: string; name: string | null; image: string | null } | null;
  category?: { id: string; name: string; slug: string } | null;
}

export interface HeroSliderProps {
  featuredPosts: FeaturedPost[];
}
