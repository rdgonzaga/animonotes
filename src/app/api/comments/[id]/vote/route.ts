import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/features/auth/lib/auth';
import { sseBroadcaster } from '@/lib/sse-broadcaster';

// POST /api/comments/[id]/vote - Vote on comment
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { value } = body; // 1 for upvote, -1 for downvote

    if (value !== 1 && value !== -1) {
      return NextResponse.json({ error: 'Invalid vote value. Must be 1 or -1' }, { status: 400 });
    }

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: id },
    });

    if (!comment || comment.deletedAt) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Check existing vote
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_commentId: {
          userId: session.user.id,
          commentId: id,
        },
      },
    });

    // Calculate new score after vote change
    const calculateNewScore = async () => {
      const votes = await prisma.vote.findMany({
        where: { commentId: id },
        select: { value: true },
      });
      return votes.reduce((sum, vote) => sum + vote.value, 0);
    };

    let newScore: number;

    if (existingVote) {
      // If same vote, remove it (toggle off)
      if (existingVote.value === value) {
        await prisma.vote.delete({
          where: {
            userId_commentId: {
              userId: session.user.id,
              commentId: id,
            },
          },
        });
        newScore = await calculateNewScore();

        // Broadcast vote update via SSE
        sseBroadcaster.broadcast({
          type: 'vote-update',
          data: {
            targetId: id,
            targetType: 'comment',
            score: newScore,
            userId: session.user.id,
          },
          channel: `post-${comment.postId}`,
        });

        return NextResponse.json({ message: 'Vote removed', value: 0, score: newScore });
      } else {
        // Change vote
        await prisma.vote.update({
          where: {
            userId_commentId: {
              userId: session.user.id,
              commentId: id,
            },
          },
          data: { value },
        });
        newScore = await calculateNewScore();

        // Broadcast vote update via SSE
        sseBroadcaster.broadcast({
          type: 'vote-update',
          data: {
            targetId: id,
            targetType: 'comment',
            score: newScore,
            userId: session.user.id,
          },
          channel: `post-${comment.postId}`,
        });

        return NextResponse.json({ message: 'Vote updated', value, score: newScore });
      }
    } else {
      // Create new vote
      await prisma.vote.create({
        data: {
          userId: session.user.id,
          commentId: id,
          value,
        },
      });
      newScore = await calculateNewScore();

      // Broadcast vote update via SSE
      sseBroadcaster.broadcast({
        type: 'vote-update',
        data: {
          targetId: id,
          targetType: 'comment',
          score: newScore,
          userId: session.user.id,
        },
        channel: `post-${comment.postId}`,
      });

      return NextResponse.json({ message: 'Vote created', value, score: newScore });
    }
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json({ error: 'Failed to process vote' }, { status: 500 });
  }
}

// DELETE /api/comments/[id]/vote - Remove vote
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.vote.deleteMany({
      where: {
        userId: session.user.id,
        commentId: id,
      },
    });

    return NextResponse.json({ message: 'Vote removed' });
  } catch (error) {
    console.error('Vote deletion error:', error);
    return NextResponse.json({ error: 'Failed to remove vote' }, { status: 500 });
  }
}
