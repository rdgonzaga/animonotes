'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, PenSquare } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { BookmarkButton } from '@/components/bookmarks/bookmark-button';
import { PostCardMenu } from '@/components/home/post-card-menu';
import { CompactVoteButtons } from '@/components/votes/compact-vote-buttons';

interface PostListProps {
  posts: any[];
  emptyMessage?: {
    title: string;
    description: string;
  };
}

export function PostList({ posts, emptyMessage }: PostListProps) {
  const defaultEmpty = {
    title: 'No posts yet',
    description: 'Be the first to create one!',
  };

  const empty = emptyMessage || defaultEmpty;

  if (posts.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-16 text-center">
          <PenSquare className="h-12 w-12 text-primary/40 mx-auto mb-4" />
          <p className="text-xl font-sans font-bold mb-2">{empty.title}</p>
          <p className="text-muted-foreground mb-6">{empty.description}</p>
          <Link href="/posts/new">
            <Button className="gap-2">
              <PenSquare className="h-4 w-4" />
              Create the First Post
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {posts.map((post: any) => (
        <Card key={post.id} className="group hover:shadow-md transition-all duration-200">
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
                  <span className="text-sm font-semibold">{post.author?.name || 'Anonymous'}</span>
                </div>

                {/* Title */}
                <Link href={`/posts/${post.id}`}>
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors mb-0.5">
                    {post.title}
                  </h3>
                </Link>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {post.content
                    .replace(/<[^>]*>/g, '')
                    .trim()
                    .substring(0, 150)}
                </p>

                {/* Stats footer */}
                <div className="flex justify-start mt-3 mb-3 gap-3 flex-wrap items-center">
                  {post.category && <span className="badge-category">{post.category.name}</span>}
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(post.createdAt), 'MMM d, yyyy • h:mm a')}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <CompactVoteButtons
                    targetId={post.id}
                    targetType="post"
                    initialScore={post.score}
                    commentCount={post._count?.comments || 0}
                  />
                </div>
              </div>

              {/* Thumbnail + actions */}
              <div className="hidden md:flex w-40 shrink-0 flex-col items-end gap-2">
                <div className="flex gap-1">
                  <BookmarkButton postId={post.id} />
                  <PostCardMenu postId={post.id} postTitle={post.title} />
                </div>
                <div className="w-32 h-32 rounded-lg bg-primary/10 overflow-hidden">
                  {post.image ? (
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full gradient-green-subtle opacity-60" />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
