import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CategoryBadge } from '@/features/categories/components/category-badge';
import { VoteButtons } from '@/features/votes/components/vote-buttons';
import { ShareButton } from '@/features/share/components/share-button';
import { AnonCommentList } from '@/features/anonymous/components/anon-comment-list';
import { AnonDisclaimer } from '@/features/anonymous/components/anon-disclaimer';
import { auth } from '@/features/auth/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserX } from 'lucide-react';

async function getAnonymousPost(id: string) {
  const res = await fetch(
    `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/anonymous/posts/${id}`,
    {
      cache: 'no-store',
    }
  );
  if (!res.ok) return null;
  return res.json();
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

  return (
    <div className="max-w-4xl mx-auto w-full py-8 px-4">
      <AnonDisclaimer />

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
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                    <UserX className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="font-medium text-orange-600">Anonymous</span>
                </div>
                <span>•</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
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
            <ShareButton url={`/anonymous/${post.id}`} title={post.title} />
          </div>
        </CardContent>
      </Card>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Comments</h2>
        <Card>
          <CardContent className="pt-6">
            <AnonCommentList postId={post.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
