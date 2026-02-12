'use client';

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Eye, MessageSquare } from 'lucide-react';
import { BookmarkButton } from '@/features/bookmarks/components/bookmark-button';
import { PostCardMenu } from '@/features/home/components/post-card-menu';
import { SortDropdown, type SortOption } from '@/features/home/components/sort-dropdown';

interface Post {
  id: string;
  title: string;
  content: string;
  image?: string | null;
  createdAt: string | Date;
  score: number;
  author?: { id: string; name: string | null; image: string | null } | null;
  category?: { id: string; name: string; slug: string } | null;
  _count?: { comments: number; votes: number };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

type TabFilter = 'for-you' | 'trending' | 'by-category';

interface FeedSectionProps {
  posts: Post[];
  categories: Category[];
}

export function FeedSection({ posts, categories }: FeedSectionProps) {
  const [activeTab, setActiveTab] = useState<TabFilter>('for-you');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredAndSortedPosts = useMemo(() => {
    let filtered = [...posts];

    // Filter by tab
    if (activeTab === 'by-category' && selectedCategory) {
      filtered = filtered.filter((p) => p.category?.slug === selectedCategory);
    }

    // Sort
    if (activeTab === 'trending') {
      filtered.sort((a, b) => b.score - a.score);
    } else {
      switch (sortBy) {
        case 'newest':
          filtered.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          break;
        case 'most-voted':
          filtered.sort((a, b) => b.score - a.score);
          break;
        case 'most-commented':
          filtered.sort((a, b) => (b._count?.comments || 0) - (a._count?.comments || 0));
          break;
      }
    }

    return filtered;
  }, [posts, activeTab, sortBy, selectedCategory]);

  const tabs: { key: TabFilter; label: string }[] = [
    { key: 'for-you', label: 'For you' },
    { key: 'trending', label: 'Trending' },
    { key: 'by-category', label: 'By category' },
  ];

  return (
    <div className="flex-1 min-w-0 space-y-4">
      {/* Tab Navigation */}
      <div className="border-b border-border bg-card rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-0">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  if (tab.key !== 'by-category') setSelectedCategory(null);
                }}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {activeTab !== 'trending' && <SortDropdown currentSort={sortBy} onSort={setSortBy} />}
        </div>
      </div>

      {/* Category pills (only when "By category" tab is active) */}
      {activeTab === 'by-category' && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              selectedCategory === null
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                selectedCategory === cat.slug
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Feed Posts */}
      {filteredAndSortedPosts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <MessageSquare className="h-12 w-12 text-primary/40 mx-auto mb-4" />
            <p className="text-xl font-serif font-bold mb-2">
              {activeTab === 'by-category' && selectedCategory
                ? 'No posts in this category'
                : 'No posts yet'}
            </p>
            <p className="text-muted-foreground mb-6">
              {activeTab === 'by-category' && selectedCategory
                ? 'Try selecting a different category.'
                : 'Be the first to start a conversation.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        filteredAndSortedPosts.map((post) => (
          <Card
            key={post.id}
            className="group hover:shadow-md transition-all duration-200 overflow-hidden"
          >
            <CardContent className="p-4 md:p-5">
              <div className="flex gap-4">
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-end gap-1 md:hidden">
                    <BookmarkButton postId={post.id} />
                    <PostCardMenu postId={post.id} postTitle={post.title} />
                  </div>
                  {/* Author row */}
                  <div className="flex items-center gap-2 mb-2 mt-3">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={post.author?.image || undefined} />
                      <AvatarFallback className="text- bg-muted text-muted-foreground">
                        {post.author?.name?.charAt(0).toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-semibold">
                      {post.author?.name || 'Anonymous'}
                    </span>
                  </div>

                  {/* Title */}
                  <Link href={`/posts/${post.id}`}>
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-2 mb-0.5">
                      {post.title}
                    </h3>
                  </Link>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {post.content.replace(/<[^>]*>/g, '').substring(0, 200)}
                  </p>

                  {/* Stats footer */}
                  <div className="flex justify-start mt-3 mb-3">
                    {post.category && <span className="badge-category">{post.category.name}</span>}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(post.createdAt), 'MMM d')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      {post.score >= 0 ? post.score : 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {post._count?.comments || 0}
                    </span>
                  </div>
                </div>

                {/* Thumbnail + actions*/}
                <div className="hidden md:flex w-35 shrink-0 flex-col items-end gap-2">
                  <div className="flex gap-1">
                    <BookmarkButton postId={post.id} />
                    <PostCardMenu postId={post.id} postTitle={post.title} />
                  </div>
                  <div className="w-32 h-32 rounded-lg bg-primary/10 overflow-hidden">
                    {post.image ? (
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full gradient-green-subtle opacity-60" />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
