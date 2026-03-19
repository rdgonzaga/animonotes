'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PostList } from '@/features/posts/components/post-list';

interface InfinitePostFeedProps {
  initialPosts: any[];
  initialPage: number;
  totalPages: number;
  limit: number;
}

interface PostsResponse {
  posts: any[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function InfinitePostFeed({
  initialPosts,
  initialPage,
  totalPages,
  limit,
}: InfinitePostFeedProps) {
  const [posts, setPosts] = useState<any[]>(initialPosts);
  const [page, setPage] = useState(initialPage);
  const [maxPages, setMaxPages] = useState(totalPages);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const hasMore = useMemo(() => page < maxPages, [page, maxPages]);

  const loadNextPage = useCallback(async () => {
    if (isLoading || !hasMore) {
      return;
    }

    setIsLoading(true);
    setHasError(false);

    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/posts?page=${nextPage}&limit=${limit}`, {
        method: 'GET',
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error('Failed to fetch next page');
      }

      const data: PostsResponse = await res.json();
      const newPosts = Array.isArray(data.posts) ? data.posts : [];

      setPosts((prev) => {
        const seen = new Set(prev.map((post) => post.id));
        const deduped = newPosts.filter((post) => !seen.has(post.id));
        return [...prev, ...deduped];
      });
      setPage(data.pagination?.page ?? nextPage);
      setMaxPages(data.pagination?.totalPages ?? maxPages);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [hasMore, isLoading, limit, maxPages, page]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry?.isIntersecting) {
          void loadNextPage();
        }
      },
      {
        root: null,
        rootMargin: '600px 0px',
        threshold: 0,
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loadNextPage]);

  return (
    <div className="space-y-4">
      <PostList posts={posts} />

      {hasMore && <div ref={sentinelRef} className="h-8" aria-hidden="true" />}

      {isLoading && (
        <p className="text-center text-sm text-muted-foreground py-2">Loading more posts...</p>
      )}

      {hasError && (
        <button
          type="button"
          onClick={() => void loadNextPage()}
          className="mx-auto block text-sm text-primary hover:underline"
        >
          Could not load more posts. Try again.
        </button>
      )}

      {!hasMore && posts.length > 0 && (
        <p className="text-center text-xs text-muted-foreground py-2">You are all caught up.</p>
      )}
    </div>
  );
}
