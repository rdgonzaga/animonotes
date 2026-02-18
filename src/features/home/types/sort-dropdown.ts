export type SortOption = 'newest' | 'most-voted' | 'most-commented';

export interface SortDropdownProps {
  currentSort: SortOption;
  onSort: (sort: SortOption) => void;
}
