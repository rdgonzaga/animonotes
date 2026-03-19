import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/session';
import { HeroSlider } from '@/features/home/components/hero-slider';
import { Sidebar } from '@/components/layout/sidebar';
import { InfinitePostFeed } from '@/features/posts/components/infinite-post-feed';
import { SiteFooter } from '@/components/layout/site-footer';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 10;
const ANON_PROFILE_IMAGE = '/profile_anon.webp';

async function getPosts(page = 1, limit = PAGE_SIZE) {
  try {
    const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
    const safeLimit = Number.isFinite(limit)
      ? Math.min(Math.max(Math.floor(limit), 1), 50)
      : PAGE_SIZE;
    const skip = (safePage - 1) * safeLimit;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { deletedAt: null },
        include: {
          author: { select: { id: true, name: true, image: true } },
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { comments: true, votes: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: safeLimit,
      }),
      prisma.post.count({ where: { deletedAt: null } }),
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

async function getCategories() {
  try {
    return await prisma.category.findMany({ orderBy: { name: 'asc' } });
  } catch {
    return [];
  }
}

async function getBookmarkedPosts() {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return { bookmarks: [], isAuthenticated: false };
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        post: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 3,
    });

    return { bookmarks, isAuthenticated: true };
  } catch {
    return { bookmarks: [], isAuthenticated: false };
  }
}

export default async function HomePage() {
  const [{ posts, pagination }, categories, { bookmarks, isAuthenticated }] = await Promise.all([
    getPosts(1, PAGE_SIZE),
    getCategories(),
    getBookmarkedPosts(),
  ]);

  // Serialize dates for client components (Date objects can't be passed as props)
  const serializedPosts = posts.map((post) => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    deletedAt: post.deletedAt ? post.deletedAt.toISOString() : null,
  }));

  const featuredPosts = serializedPosts.slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      {/* Featured Hero Banner with slider */}
      <HeroSlider featuredPosts={featuredPosts} />

      {/* Main Content: 3-column layout */}
      <div className="max-w-7xl mx-auto w-full px-4 py-6">
        <div className="flex gap-6 items-start">
          {/* Left Sidebar — Desktop only */}
          <div className="hidden lg:flex w-44 xl:w-48 shrink-0 flex-col sticky top-6 self-start max-h-[calc(100vh-8rem)] overflow-y-auto no-scrollbar pr-1">
            <Sidebar />
            <SiteFooter compact />
          </div>

          {/* Main Feed */}
          <main
            id="home-feed-scroll"
            className="flex-1 min-w-0 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1 no-scrollbar"
          >
            <div className="max-w-4xl mx-auto">
              <InfinitePostFeed
                initialPosts={serializedPosts}
                initialPage={pagination.page}
                totalPages={pagination.totalPages}
                limit={pagination.limit}
                observerRootId="home-feed-scroll"
              />
            </div>
          </main>

          {/* Right Sidebar — Desktop only */}
          <aside className="hidden xl:flex flex-col gap-5 w-72 shrink-0 sticky top-6 self-start max-h-[calc(100vh-8rem)] overflow-y-auto no-scrollbar pr-1">
            {/* Recently visited */}
            <Card>
              <CardHeader className="pb-2 flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold">Recently visited</CardTitle>
                <button className="text-xs text-muted-foreground hover:text-primary">Clear</button>
              </CardHeader>
              <CardContent className="space-y-3">
                {posts.slice(0, 3).map((post) => (
                  <Link key={post.id} href={`/posts/${post.id}`} className="block group">
                    <div className="flex items-start gap-2">
                      <Avatar className="h-5 w-5 mt-0.5">
                        <AvatarImage src={post.author?.image || ANON_PROFILE_IMAGE} />
                        <AvatarFallback className="text-[10px] bg-muted">
                          {post.author?.name?.charAt(0) || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-xs font-medium line-clamp-1 group-hover:text-primary transition-colors">
                          {post.title}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {post.category && (
                            <span className="badge-category text-[10px] py-0 px-1.5">
                              {post.category.name}
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(post.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>

            {/* College categories */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">College Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/posts?category=${cat.slug}`}
                      className="text-center text-xs font-medium px-3 py-2 rounded-lg border border-border hover:border-primary hover:text-primary transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Read later */}
            <Card>
              <CardHeader className="pb-2 flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold">Read later</CardTitle>
                <button className="text-xs text-muted-foreground hover:text-primary">Clear</button>
              </CardHeader>
              <CardContent>
                {!isAuthenticated ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    Sign in to save posts
                  </p>
                ) : bookmarks.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No saved posts yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {bookmarks.map((bookmark) => (
                      <Link
                        key={bookmark.id}
                        href={`/posts/${bookmark.post.id}`}
                        className="block group"
                      >
                        <div className="flex items-start gap-2">
                          <Avatar className="h-5 w-5 mt-0.5">
                            <AvatarImage src={bookmark.post.author?.image || ANON_PROFILE_IMAGE} />
                            <AvatarFallback className="text-[10px] bg-muted">
                              {bookmark.post.author?.name?.charAt(0) || 'A'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-xs font-medium line-clamp-1 group-hover:text-primary transition-colors">
                              {bookmark.post.title}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5">
                              {bookmark.post.category && (
                                <span className="badge-category text-[10px] py-0 px-1.5">
                                  {bookmark.post.category.name}
                                </span>
                              )}
                              <span className="text-[10px] text-muted-foreground">
                                {bookmark.post.createdAt.toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                <Link href="/bookmarks">
                  <Button variant="ghost" size="sm" className="w-full text-xs text-primary">
                    See all bookmarks <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
