import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Eye, MessageSquare } from 'lucide-react';
import { BookmarkButton } from '@/components/bookmarks/bookmark-button';
import { PostCardMenu } from '@/components/home/post-card-menu';
import { PenSquare } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Sidebar } from '@/components/layout/sidebar';
import { format } from 'date-fns';

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

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const { posts } = await getPosts(category);

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

              <div className="space-y-4">
                {posts.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="py-16 text-center">
                      <PenSquare className="h-12 w-12 text-primary/40 mx-auto mb-4" />
                      <p className="text-xl font-sans font-bold mb-2">
                        {category ? `No posts in ${category} category` : 'No posts yet'}
                      </p>
                      <p className="text-muted-foreground mb-6">
                        {category
                          ? 'Be the first to create a post in this category!'
                          : 'Be the first to create one!'}
                      </p>
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
                    <Card
                      key={post.id}
                      className="group hover:shadow-md transition-all duration-200"
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
                              {post.content.replace(/<[^>]*>/g, '').substring(0, 150)}
                            </p>

                            {/* Stats footer */}
                            <div className="flex justify-start mt-3 mb-3">
                              {post.category && (
                                <span className="badge-category">{post.category.name}</span>
                              )}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
