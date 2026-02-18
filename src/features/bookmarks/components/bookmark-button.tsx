'use client';

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Bookmark } from 'lucide-react';
import type { BookmarkButtonProps, CacheState } from '../types/bookmark-button';
import { authClient } from '@/lib/auth-client';

// ─── Shared bookmark cache ──────────────────────────────────────────────────
// Module-level singleton: one fetch for ALL BookmarkButton instances on the page.
// Uses useSyncExternalStore for tear-free reads.

let cache: CacheState = { ids: new Set(), status: 'idle' };
let listeners = new Set<() => void>();
let fetchPromise: Promise<void> | null = null;

function getSnapshot(): CacheState {
  return cache;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit() {
  // Replace reference so useSyncExternalStore detects the change
  cache = { ...cache, ids: new Set(cache.ids) };
  listeners.forEach((l) => l());
}

function fetchBookmarkIds(): Promise<void> {
  if (fetchPromise) return fetchPromise;
  if (cache.status === 'ready') return Promise.resolve();

  cache = { ...cache, status: 'loading' };
  emit();

  fetchPromise = fetch('/api/bookmarks/ids')
    .then((res) => {
      if (!res.ok) throw new Error('Failed to fetch bookmark IDs');
      return res.json();
    })
    .then((postIds: string[]) => {
      cache = { ids: new Set(postIds), status: 'ready' };
      emit();
    })
    .catch(() => {
      cache = { ...cache, status: 'error' };
      emit();
    })
    .finally(() => {
      fetchPromise = null;
    });

  return fetchPromise;
}

function addToCache(postId: string) {
  cache.ids.add(postId);
  emit();
}

function removeFromCache(postId: string) {
  cache.ids.delete(postId);
  emit();
}

// ─── Component ──────────────────────────────────────────────────────────────

export function BookmarkButton({ postId, initialBookmarked }: BookmarkButtonProps) {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const cacheState = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const [loading, setLoading] = useState(false);

  // If initialBookmarked is explicitly true, seed the cache so other buttons benefit
  useEffect(() => {
    if (initialBookmarked === true) {
      addToCache(postId);
    }
  }, [initialBookmarked, postId]);

  // Trigger shared fetch once when a logged-in user is present
  useEffect(() => {
    if (session?.user && cacheState.status === 'idle') {
      fetchBookmarkIds();
    }
  }, [session, cacheState.status]);

  // Derive bookmarked state: explicit prop wins until cache is ready
  const bookmarked =
    initialBookmarked !== undefined && cacheState.status !== 'ready'
      ? initialBookmarked
      : cacheState.ids.has(postId);

  const handleToggle = useCallback(async () => {
    if (!session) {
      router.push('/login');
      return;
    }

    setLoading(true);

    // Optimistic update
    const wasBookmarked = bookmarked;
    if (wasBookmarked) {
      removeFromCache(postId);
    } else {
      addToCache(postId);
    }

    try {
      if (wasBookmarked) {
        await fetch(`/api/posts/${postId}/bookmark`, { method: 'DELETE' });
      } else {
        const res = await fetch(`/api/posts/${postId}/bookmark`, { method: 'POST' });
        if (!res.ok && res.status !== 409) {
          throw new Error('Failed to bookmark');
        }
      }
    } catch (error) {
      // Revert optimistic update
      if (wasBookmarked) {
        addToCache(postId);
      } else {
        removeFromCache(postId);
      }
      console.error('Bookmark error:', error);
    } finally {
      setLoading(false);
    }
  }, [session, router, bookmarked, postId]);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      disabled={loading}
      className={bookmarked ? 'text-yellow-500' : ''}
    >
      <Bookmark className={`h-5 w-5 ${bookmarked ? 'fill-current' : ''}`} />
    </Button>
  );
}
