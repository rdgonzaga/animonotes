import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CategoryBadge } from '@/components/categories/category-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function getBookmarks(userId: string) {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId,
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
            _count: {
              select: {
                comments: true,
                votes: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate vote scores for each post
    const bookmarksWithScores = await Promise.all(
      bookmarks.map(async (bookmark) => {
        const votes = await prisma.vote.findMany({
          where: { postId: bookmark.post.id },
          select: { value: true },
        });
        const score = votes.reduce((sum, vote) => sum + vote.value, 0);
        return {
          ...bookmark,
          post: {
            ...bookmark.post,
            score,
          },
        };
      })
    );

    return bookmarksWithScores;
  } catch (error) {
    console.error('Bookmarks fetch error:', error);
    return [];
  }
}

export default async function BookmarksPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const bookmarks = await getBookmarks(session.user.id);

  return (
    <div className="max-w-4xl mx-auto w-full py-8 px-4">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">My Bookmarks</h1>

      <div className="space-y-4">
        {bookmarks.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No bookmarks yet. Bookmark posts to save them for later!
            </CardContent>
          </Card>
        ) : (
          bookmarks.map((bookmark: any) => (
            <Card key={bookmark.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Link href={`/posts/${bookmark.post.id}`}>
                      <h2 className="text-xl font-semibold hover:text-primary transition-colors">
                        {bookmark.post.title}
                      </h2>
                    </Link>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground flex-wrap">
                      {bookmark.post.author ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={bookmark.post.author.image || undefined} />
                            <AvatarFallback>
                              {bookmark.post.author.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>{bookmark.post.author.name}</span>
                        </div>
                      ) : (
                        <span>Anonymous</span>
                      )}
                      <span>•</span>
                      <span>{new Date(bookmark.post.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <CategoryBadge
                        name={bookmark.post.category.name}
                        slug={bookmark.post.category.slug}
                      />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{bookmark.post.score}</div>
                    <div className="text-xs text-muted-foreground">votes</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>{bookmark.post._count.comments} comments</span>
                  <span>•</span>
                  <span>Bookmarked {new Date(bookmark.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
