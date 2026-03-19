import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, PenSquare, Pin } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Sidebar } from '@/components/layout/sidebar';
import { PostList } from '@/features/posts/components/post-list';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 10;

async function getPosts(categorySlug?: string, page = 1, limit = PAGE_SIZE) {
  try {
    const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
    const safeLimit = Number.isFinite(limit)
      ? Math.min(Math.max(Math.floor(limit), 1), 50)
      : PAGE_SIZE;
    const skip = (safePage - 1) * safeLimit;

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
        skip,
        take: safeLimit,
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

    return {
      posts: postsWithScores,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  } catch {
    return { posts: [], pagination: { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0 } };
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
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const { category, page: pageParam } = await searchParams;
  const parsedPage = Number(pageParam || '1');
  const currentPage = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.floor(parsedPage) : 1;

  const [{ posts, pagination }, pinnedPosts] = await Promise.all([
    getPosts(category, currentPage, PAGE_SIZE),
    getPinnedPosts(category),
  ]);

  const buildPageHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (category) {
      params.set('category', category);
    }
    if (targetPage > 1) {
      params.set('page', String(targetPage));
    }

    const query = params.toString();
    return query ? `/posts?${query}` : '/posts';
  };

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

              {pagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    aria-disabled={pagination.page <= 1}
                  >
                    <Link
                      href={buildPageHref(Math.max(1, pagination.page - 1))}
                      tabIndex={pagination.page <= 1 ? -1 : undefined}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Link>
                  </Button>

                  <span className="text-sm text-muted-foreground px-3">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>

                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                    aria-disabled={pagination.page >= pagination.totalPages}
                  >
                    <Link
                      href={buildPageHref(Math.min(pagination.totalPages, pagination.page + 1))}
                      tabIndex={pagination.page >= pagination.totalPages ? -1 : undefined}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
