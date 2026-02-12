import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AnonPostCard } from '@/components/anonymous/anon-post-card';
import { AnonDisclaimer } from '@/components/anonymous/anon-disclaimer';
import { Sidebar } from '@/components/layout/sidebar';
import { Shield, PenLine } from 'lucide-react';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getAnonymousPosts() {
  try {
    const where = { deletedAt: null, isAnonymous: true, authorId: null };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
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

export default async function AnonymousPage() {
  const { posts, pagination } = await getAnonymousPosts();

  return (
    <div className="max-w-7xl mx-auto w-full px-4 py-6">
      <div className="flex gap-6">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                <h1 className="font-serif text-3xl sm:text-4xl font-bold">Anonymous Q&amp;A</h1>
              </div>
              <span className="accent-line mt-2" />
              <p className="text-muted-foreground mt-3">
                Ask questions anonymously — your identity is never stored
              </p>
            </div>
            <Link href="/anonymous/new">
              <Button className="gap-2">
                <PenLine className="h-4 w-4" />
                Ask Anonymously
              </Button>
            </Link>
          </div>

          <AnonDisclaimer />

          <div className="space-y-4 mt-6">
            {posts.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-16 text-center">
                  <Shield className="h-12 w-12 text-primary/40 mx-auto mb-4" />
                  <p className="text-xl font-serif font-bold mb-2">No anonymous posts yet</p>
                  <p className="text-muted-foreground mb-6">Be the first to ask a question!</p>
                  <Link href="/anonymous/new">
                    <Button className="gap-2">
                      <PenLine className="h-4 w-4" />
                      Ask a Question
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              posts.map((post: any) => <AnonPostCard key={post.id} post={post} />)
            )}
          </div>

          {pagination.totalPages > 1 && (
            <div className="mt-8 text-center text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
