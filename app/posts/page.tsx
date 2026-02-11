import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CategoryBadge } from '@/components/categories/category-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  PenSquare,
  BookOpen,
  Calendar,
  Eye,
  MessageSquare,
  Bookmark,
  MoreHorizontal,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getPosts(categorySlug?: string) {
  try {
    const where = {
      deletedAt: null,
      ...(categorySlug && { category: { slug: categorySlug } }),
    };
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, image: true } },
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { comments: true, votes: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.post.count({ where }),
    ]);

    const postsWithScores = await Promise.all(
      posts.map(async (post) => {
        const votes = await prisma.vote.findMany({
          where: { postId: post.id },
          select: { value: true },
        });
        const score = votes.reduce((sum, vote) => sum + vote.value, 0);
        return { ...post, score };
      })
    );

    return {
      posts: postsWithScores,
      pagination: { page: 1, limit: 10, total, totalPages: Math.ceil(total / 10) },
    };
  } catch {
    return { posts: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
  }
}

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const { posts, pagination } = await getPosts(category);

  return (
    <div className="max-w-4xl mx-auto w-full py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">Posts</h1>
          <span className="accent-line mt-2" />
        </div>
        <Link href="/posts/new">
          <Button className="gap-2">
            <PenSquare className="h-4 w-4" />
            Create Post
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <BookOpen className="h-12 w-12 text-primary/40 mx-auto mb-4" />
              <p className="text-xl font-serif font-bold mb-2">No posts yet</p>
              <p className="text-muted-foreground mb-6">Be the first to create one!</p>
              <Link href="/posts/new">
                <Button className="gap-2">
                  <PenSquare className="h-4 w-4" />
                  Create the First Post
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          posts.map((post: any) => (
            <Card key={post.id} className="group hover:shadow-md transition-all duration-200">
              <CardContent className="p-5">
                <div className="flex justify-end gap-1 mb-2">
                  <button className="text-muted-foreground hover:text-primary transition-colors">
                    <Bookmark className="h-4 w-4" />
                  </button>
                  <button className="text-muted-foreground hover:text-primary transition-colors">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {post.author ? (
                        <>
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={post.author.image || undefined} />
                            <AvatarFallback className="text-xs bg-muted">
                              {post.author.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-semibold">{post.author.name}</span>
                        </>
                      ) : (
                        <span className="text-sm font-semibold">Anonymous</span>
                      )}
                    </div>
                    <Link href={`/posts/${post.id}`}>
                      <h2 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1 mb-1">
                        {post.title}
                      </h2>
                    </Link>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {post.content.replace(/<[^>]*>/g, '').substring(0, 150)}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(post.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {post.score}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {post._count.comments}
                      </span>
                      {post.category && (
                        <span className="badge-category ml-auto">{post.category.name}</span>
                      )}
                    </div>
                  </div>
                  <div className="hidden md:block w-28 h-24 rounded-lg bg-primary/10 shrink-0 overflow-hidden">
                    <div className="w-full h-full gradient-green-subtle opacity-60" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
