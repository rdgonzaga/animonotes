import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { CategoryBadgeProps } from '../types/category';

export function CategoryBadge({ name, slug, variant = 'secondary' }: CategoryBadgeProps) {
  return (
    <Link href={`/posts?category=${slug}`}>
      <Badge variant={variant} className="hover:bg-accent cursor-pointer">
        {name}
      </Badge>
    </Link>
  );
}
