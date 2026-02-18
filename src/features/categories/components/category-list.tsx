'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { CategoryListProps } from '../types/category';

export function CategoryList({ categories }: CategoryListProps) {
  return (
    <nav className="space-y-2">
      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
        Categories
      </h3>
      <div className="space-y-1">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/posts?category=${category.slug}`}
            className="block px-3 py-2 rounded-md hover:bg-accent transition-colors"
          >
            <div className="font-medium">{category.name}</div>
            {category.description && (
              <div className="text-sm text-muted-foreground line-clamp-1">
                {category.description}
              </div>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}
