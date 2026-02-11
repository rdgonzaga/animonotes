'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type SortOption = 'newest' | 'most-voted' | 'most-commented';

const SORT_LABELS: Record<SortOption, string> = {
  newest: 'Newest',
  'most-voted': 'Most Voted',
  'most-commented': 'Most Commented',
};

interface SortDropdownProps {
  currentSort: SortOption;
  onSort: (sort: SortOption) => void;
}

export function SortDropdown({ currentSort, onSort }: SortDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs rounded-full">
          Sort by: {SORT_LABELS[currentSort]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([value, label]) => (
          <DropdownMenuItem
            key={value}
            onClick={() => onSort(value)}
            className={currentSort === value ? 'font-semibold text-primary' : ''}
          >
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
