import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AnonPostCard } from '@/components/anonymous/anon-post-card';
import { AnonDisclaimer } from '@/components/anonymous/anon-disclaimer';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getAnonymousPosts() {
  try {
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: {
          deletedAt: null,
          isAnonymous: true,
          authorId: null,
        },
        include: {
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
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      }),
      prisma.post.count({
        where: {
          deletedAt: null,
          isAnonymous: true,
          authorId: null,
        },
      }),
    ]);

    // Calculate vote scores
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
      pagination: {
        page: 1,
        limit: 10,
        total,
        totalPages: Math.ceil(total / 10),
      },
    };
  } catch (error) {
    console.error('Anonymous posts fetch error:', error);
    return {
      posts: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
  }
}

export default async function AnonymousPage() {
  const { posts, pagination } = await getAnonymousPosts();

  // Serialize dates for client components
  const serializedPosts = posts.map((post) => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    deletedAt: post.deletedAt ? post.deletedAt.toISOString() : null,
  }));

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Anonymous Q&A</h1>
          <p className="text-muted-foreground mt-1">
            Ask questions anonymously - your identity is never stored
          </p>
        </div>
        <Link href="/anonymous/new">
          <Button>Ask Anonymously</Button>
        </Link>
      </div>

      <AnonDisclaimer />

      <div className="space-y-4">
        {serializedPosts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No anonymous posts yet. Be the first to ask a question!
            </CardContent>
          </Card>
        ) : (
          serializedPosts.map((post) => <AnonPostCard key={post.id} post={post} />)
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Page {pagination.page} of {pagination.totalPages}
        </div>
      )}
    </div>
  );
}
