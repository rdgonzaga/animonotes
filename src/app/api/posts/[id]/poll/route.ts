import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/features/auth/lib/auth';
import { prisma } from '@/lib/prisma';
import { createPollSchema } from '@/lib/validations/poll';

// POST /api/posts/[id]/poll - Create poll for post
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createPollSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { question, options, endsAt } = validation.data;

    // Check if post exists and user is the author
    const post = await prisma.post.findUnique({
      where: { id: id },
      include: { poll: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Only the post author can add a poll' }, { status: 403 });
    }

    if (post.poll) {
      return NextResponse.json({ error: 'Post already has a poll' }, { status: 409 });
    }

    // Create poll with options
    const poll = await prisma.poll.create({
      data: {
        postId: id,
        question,
        endsAt: endsAt ? new Date(endsAt) : null,
        options: {
          create: options.map((text, index) => ({
            text,
            order: index,
          })),
        },
      },
      include: {
        options: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    return NextResponse.json(poll, { status: 201 });
  } catch (error) {
    console.error('Error creating poll:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
