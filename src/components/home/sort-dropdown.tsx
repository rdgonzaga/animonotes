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
        <Button
          variant="outline"
          size="sm"
          className="text-xs rounded-full bg-emerald-700 text-white border-emerald-600 hover:border-emerald-500"
        >
          Sort by: {SORT_LABELS[currentSort]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-emerald-800 text-white border-emerald-700">
        {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([value, label]) => (
          <DropdownMenuItem
            key={value}
            onClick={() => onSort(value)}
            className={
              currentSort === value
                ? 'font-semibold text-white bg-emerald-700'
                : 'text-white/90 focus:text-white focus:bg-emerald-700'
            }
          >
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
