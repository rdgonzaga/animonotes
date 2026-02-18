export type CacheStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface CacheState {
  ids: Set<string>;
  status: CacheStatus;
}

export interface BookmarkButtonProps {
  postId: string;
  /** When explicitly known (e.g. post detail page), skip the cache fetch. */
  initialBookmarked?: boolean;
}
