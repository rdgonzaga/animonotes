import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CategoryBadge } from '@/features/categories/components/category-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VoteButtons } from '@/features/votes/components/vote-buttons';
import { BookmarkButton } from '@/features/bookmarks/components/bookmark-button';
import { ShareButton } from '@/features/share/components/share-button';
import { ReportButton } from '@/features/moderation/components/report-button';
import { CommentList } from '@/features/comments/components/comment-list';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/session';
import { Sidebar } from '@/components/layout/sidebar';
import { format } from 'date-fns';

async function getPost(id: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { id },
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
        _count: {
          select: {
            comments: true,
            votes: true,
          },
        },
      },
    });

    if (!post || post.deletedAt) return null;

    // Calculate vote score
    const votes = await prisma.vote.findMany({
      where: { postId: post.id },
      select: { value: true },
    });
    const score = votes.reduce((sum, vote) => sum + vote.value, 0);

    return { ...post, score };
  } catch (error) {
    console.error('Post fetch error:', error);
    return null;
  }
}

async function getUserVote(postId: string, userId: string | undefined) {
  if (!userId) return null;
  const vote = await prisma.vote.findUnique({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
  });
  return vote?.value || null;
}

async function getUserBookmark(postId: string, userId: string | undefined) {
  if (!userId) return false;
  const bookmark = await prisma.bookmark.findUnique({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
  });
  return !!bookmark;
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, session] = await Promise.all([
    getPost(id),
    getServerSession(),
  ]);

  if (!post) {
    notFound();
  }

  const [userVote, userBookmarked] = await Promise.all([
    getUserVote(id, session?.user?.id),
    getUserBookmark(id, session?.user?.id),
  ]);
  const isAuthor = session?.user?.id === post.authorId;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto w-full px-4 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar — Desktop only */}
          <Sidebar />

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="max-w-4xl mx-auto w-full py-8 px-4">
              <Card>
                <CardHeader>
                  <div className="flex items-start gap-2 sm:gap-4">
                    <VoteButtons
                      targetId={post.id}
                      targetType="post"
                      initialScore={post.score}
                      initialUserVote={userVote}
                    />
                    <div className="flex-1">
                      <h1 className="text-2xl sm:text-3xl font-bold mb-4">{post.title}</h1>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                        {post.author ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={post.author.image || undefined} />
                              <AvatarFallback>
                                {post.author.name?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <Link href={`/profile/${post.author.id}`} className="hover:underline">
                              {post.author.name}
                            </Link>
                          </div>
                        ) : (
                          <span>Anonymous</span>
                        )}
                        <span>•</span>
                        <span>{format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
                        <span>•</span>
                        <CategoryBadge name={post.category.name} slug={post.category.slug} />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />

                  <div className="mt-6 pt-6 border-t flex gap-2 items-center flex-wrap">
                    <BookmarkButton postId={post.id} initialBookmarked={userBookmarked} />
                    <ShareButton url={`/posts/${post.id}`} title={post.title} />
                    <ReportButton targetId={post.id} targetType="post" />
                    {isAuthor && (
                      <Link href={`/posts/${post.id}/edit`}>
                        <Button variant="outline">Edit Post</Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Comments</h2>
                <Card>
                  <CardContent className="pt-6">
                    <CommentList postId={post.id} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
