import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createCommentSchema } from "@/lib/validations/comment";
import { sseBroadcaster } from "@/lib/sse-broadcaster";
import { notifyCommentReply } from "@/lib/notifications";

// GET /api/posts/[id]/comments - Get comments for post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const comments = await prisma.comment.findMany({
      where: {
        postId: params.id,
        deletedAt: null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            votes: true,
            replies: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Calculate vote scores
    const commentsWithScores = await Promise.all(
      comments.map(async (comment) => {
        const votes = await prisma.vote.findMany({
          where: { commentId: comment.id },
          select: { value: true },
        });
        const score = votes.reduce((sum, vote) => sum + vote.value, 0);
        return { ...comment, score };
      })
    );

    return NextResponse.json(commentsWithScores);
  } catch (error) {
    console.error("Comments fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST /api/posts/[id]/comments - Create comment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = createCommentSchema.safeParse({
      ...body,
      postId: params.id,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { content, parentId, isAnonymous } = validation.data;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: params.id },
    });

    if (!post || post.deletedAt) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // If replying to a comment, check parent exists and depth limit
    if (parentId) {
    const parent: { parentId: string | null; deletedAt: Date | null } | null = await prisma.comment.findUnique({
      where: { id: parentId },
      select: { parentId: true, deletedAt: true },
    });

      if (!parent || parent.deletedAt) {
        return NextResponse.json(
          { error: "Parent comment not found" },
          { status: 404 }
        );
      }

      // Check depth (max 5 levels)
      let depth = 1;
      let currentParent = parent;
      while (currentParent.parentId && depth < 5) {
        const nextParent = await prisma.comment.findUnique({
          where: { id: currentParent.parentId },
        });
        if (!nextParent) break;
        currentParent = nextParent;
        depth++;
      }

      if (depth >= 5) {
        return NextResponse.json(
          { error: "Maximum comment depth reached" },
          { status: 400 }
        );
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        postId: params.id,
        parentId,
        authorId: isAnonymous ? null : session.user.id,
        isAnonymous,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            votes: true,
            replies: true,
          },
        },
      },
    });

    // Broadcast new comment via SSE
    sseBroadcaster.broadcast({
      type: 'comment-new',
      data: {
        comment: {
          ...comment,
          score: 0, // New comment starts with 0 score
        },
        postId: params.id,
      },
      channel: `post-${params.id}`,
    });

    // Send notification to parent comment author if this is a reply
    if (parentId && !isAnonymous) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { authorId: true },
      });

      if (parentComment?.authorId && parentComment.authorId !== session.user.id) {
        await notifyCommentReply({
          recipientId: parentComment.authorId,
          commentId: comment.id,
          postId: params.id,
          authorName: session.user.name || "Someone",
          content,
        });
      }
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Comment creation error:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
