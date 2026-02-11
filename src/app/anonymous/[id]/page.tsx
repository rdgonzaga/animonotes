import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CategoryBadge } from '@/components/categories/category-badge';
import { VoteButtons } from '@/components/votes/vote-buttons';
import { ShareButton } from '@/components/share/share-button';
import { AnonCommentList } from '@/components/anonymous/anon-comment-list';
import { AnonDisclaimer } from '@/components/anonymous/anon-disclaimer';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserX } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getAnonymousPost(id: string) {
  try {
    const post = await prisma.post.findUnique({
      where: {
        id,
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
    });

    if (!post || post.deletedAt) {
      return null;
    }

    // Calculate vote score
    const votes = await prisma.vote.findMany({
      where: { postId: post.id },
      select: { value: true },
    });
    const score = votes.reduce((sum, vote) => sum + vote.value, 0);

    return { ...post, score };
  } catch (error) {
    console.error('Anonymous post fetch error:', error);
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

export default async function AnonymousPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, session] = await Promise.all([getAnonymousPost(id), auth()]);

  if (!post) {
    notFound();
  }

  const userVote = await getUserVote(id, session?.user?.id);

  // Serialize dates for client components
  const serializedPost = {
    ...post,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    deletedAt: post.deletedAt ? post.deletedAt.toISOString() : null,
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <AnonDisclaimer />

      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <VoteButtons
              targetId={serializedPost.id}
              targetType="post"
              initialScore={serializedPost.score}
              initialUserVote={userVote}
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-4">{serializedPost.title}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                    <UserX className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="font-medium text-orange-600">Anonymous</span>
                </div>
                <span>•</span>
                <span>{new Date(serializedPost.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <CategoryBadge
                  name={serializedPost.category.name}
                  slug={serializedPost.category.slug}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: serializedPost.content }}
          />

          <div className="mt-6 pt-6 border-t flex gap-2 items-center flex-wrap">
            <ShareButton url={`/anonymous/${serializedPost.id}`} title={serializedPost.title} />
          </div>
        </CardContent>
      </Card>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Comments</h2>
        <Card>
          <CardContent className="pt-6">
            <AnonCommentList postId={serializedPost.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
