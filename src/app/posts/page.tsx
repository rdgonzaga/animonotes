import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PenSquare, Pin } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Sidebar } from '@/components/layout/sidebar';
import { PostList } from '@/features/posts/components/post-list';

export const dynamic = 'force-dynamic';

async function getPosts(categorySlug?: string) {
  try {
    const where = {
      deletedAt: null,
      isPinned: false,
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
        take: 20,
      }),
      prisma.post.count({ where }),
    ]);

    const postIds = posts.map((post) => post.id);
    const voteSums = postIds.length
      ? await prisma.vote.groupBy({
          by: ['postId'],
          where: { postId: { in: postIds } },
          _sum: { value: true },
        })
      : [];
    const voteMap = new Map(voteSums.map((vote) => [vote.postId, vote._sum.value ?? 0]));
    const postsWithScores = posts.map((post) => ({
      ...post,
      score: voteMap.get(post.id) ?? 0,
    }));

    return { posts: postsWithScores, pagination: { total } };
  } catch {
    return { posts: [], pagination: { total: 0 } };
  }
}

async function getPinnedPosts(categorySlug?: string) {
  try {
    const where = {
      isPinned: true,
      deletedAt: null,
      ...(categorySlug && { category: { slug: categorySlug } }),
    };
    const posts = await prisma.post.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, image: true } },
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { comments: true, votes: true } },
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    const postIds = posts.map((post) => post.id);
    const voteSums = postIds.length
      ? await prisma.vote.groupBy({
          by: ['postId'],
          where: { postId: { in: postIds } },
          _sum: { value: true },
        })
      : [];
    const voteMap = new Map(voteSums.map((vote) => [vote.postId, vote._sum.value ?? 0]));
    return posts.map((post) => ({
      ...post,
      score: voteMap.get(post.id) ?? 0,
    }));
  } catch {
    return [];
  }
}

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [{ posts }, pinnedPosts] = await Promise.all([
    getPosts(category),
    getPinnedPosts(category),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto w-full px-4 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar — Desktop only */}
          <Sidebar />

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="max-w-4xl mx-auto w-full py-8 px-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h1 className="font-sans text-3xl sm:text-4xl font-bold text-foreground">
                    {category
                      ? `${category.charAt(0).toUpperCase() + category.slice(1)} Posts`
                      : 'Posts'}
                  </h1>
                  <span className="accent-line mt-2" />
                </div>
                <Link href="/posts/new">
                  <Button className="gap-2">
                    <PenSquare className="h-4 w-4" />
                    Create Post
                  </Button>
                </Link>
              </div>

              {/* Pinned posts section */}
              {pinnedPosts.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Pin className="h-4 w-4 text-primary" />
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Pinned
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {pinnedPosts.map((post) => (
                      <div key={post.id} className="relative">
                        <div className="absolute top-2 right-2 z-10">
                          <Badge variant="secondary" className="text-xs gap-1">
                            <Pin className="h-3 w-3" /> Pinned
                          </Badge>
                        </div>
                        <PostList posts={[post]} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <PostList
                  posts={posts}
                  emptyMessage={
                    category
                      ? {
                          title: `No posts in ${category} category`,
                          description: 'Be the first to create a post in this category!',
                        }
                      : undefined
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
