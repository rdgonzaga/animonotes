import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { createAnonymousCommentSchema } from '@/lib/validations/anonymous';

// Helper function to calculate comment depth
async function getCommentDepth(parentId: string): Promise<number> {
  let depth = 1;
  let currentParentId: string | null = parentId;

  while (currentParentId && depth < 10) {
    // Safety limit
    const parent: { parentId: string | null } | null = await prisma.comment.findUnique({
      where: { id: currentParentId },
      select: { parentId: true },
    });

    if (!parent) break;
    currentParentId = parent.parentId;
    depth++;
  }

  return depth;
}

// GET /api/anonymous/posts/[id]/comments - Get all comments for anonymous post
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Verify post exists and is anonymous
    const post = await prisma.post.findUnique({
      where: { id, isAnonymous: true, authorId: null },
    });

    if (!post || post.deletedAt) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const comments = await prisma.comment.findMany({
      where: {
        postId: id,
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
        createdAt: 'asc',
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

    return NextResponse.json({ comments: commentsWithScores });
  } catch (error) {
    console.error('Anonymous post comments fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

// POST /api/anonymous/posts/[id]/comments - Create anonymous comment (no auth required, tracked by cookie)
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Verify post exists and is anonymous
    const post = await prisma.post.findUnique({
      where: { id, isAnonymous: true, authorId: null },
    });

    if (!post || post.deletedAt) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const body = await request.json();
    const validation = createAnonymousCommentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { content, parentId } = validation.data;

    // If replying to a comment, check depth limit
    if (parentId) {
      const depth = await getCommentDepth(parentId);
      if (depth >= 5) {
        return NextResponse.json({ error: 'Maximum comment depth (5) reached' }, { status: 400 });
      }

      // Verify parent comment exists
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment || parentComment.deletedAt) {
        return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 });
      }
    }

    // Create anonymous comment
    const comment = await prisma.comment.create({
      data: {
        content,
        postId: id,
        parentId: parentId || null,
        authorId: null, // TRUE anonymity
        isAnonymous: true,
      },
      include: {
        _count: {
          select: {
            votes: true,
            replies: true,
          },
        },
      },
    });

    // Store comment ID in cookie for edit/delete rights
    const cookieStore = await cookies();
    const anonComments = cookieStore.get('anonComments')?.value || '[]';
    let commentIds: string[] = [];
    try {
      commentIds = JSON.parse(anonComments);
    } catch {
      commentIds = [];
    }
    commentIds.push(comment.id);

    cookieStore.set('anonComments', JSON.stringify(commentIds), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Anonymous comment creation error:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}
