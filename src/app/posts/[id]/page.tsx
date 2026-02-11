import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CategoryBadge } from "@/components/categories/category-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VoteButtons } from "@/components/votes/vote-buttons";
import { BookmarkButton } from "@/components/bookmarks/bookmark-button";
import { ShareButton } from "@/components/share/share-button";
import { ReportButton } from "@/components/moderation/report-button";
import { CommentList } from "@/components/comments/comment-list";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getPost(id: string) {
  const res = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/posts/${id}`, {
    cache: "no-store",
  });
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

export default async function PostPage({ params }: { params: { id: string } }) {
  const [post, session] = await Promise.all([
    getPost(params.id),
    auth(),
  ]);

  if (!post) {
    notFound();
  }

  const [userVote, userBookmarked] = await Promise.all([
    getUserVote(params.id, session?.user?.id),
    getUserBookmark(params.id, session?.user?.id),
  ]);
  const isAuthor = session?.user?.id === post.authorId;

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <VoteButtons
              targetId={post.id}
              targetType="post"
              initialScore={post.score}
              initialUserVote={userVote}
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
  );
}
