import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface CategoryBadgeProps {
  name: string;
  slug: string;
  variant?: 'default' | 'secondary' | 'outline';
}

export function CategoryBadge({ name, slug, variant = 'secondary' }: CategoryBadgeProps) {
  return (
    <Link href={`/posts?category=${slug}`}>
      <Badge variant={variant} className="hover:bg-accent cursor-pointer">
        {name}
      </Badge>
    </Link>
  );
}
