export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface CategoryListProps {
  categories: Category[];
}

export interface CategoryBadgeProps {
  name: string;
  slug: string;
  variant?: 'default' | 'secondary' | 'outline';
}
