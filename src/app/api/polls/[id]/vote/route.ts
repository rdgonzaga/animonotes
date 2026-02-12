import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/features/auth/lib/auth';
import { prisma } from '@/lib/prisma';
import { votePollSchema } from '@/lib/validations/poll';

// POST /api/polls/[id]/vote - Vote on poll
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = votePollSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { optionId } = validation.data;

    // Check if poll exists
    const poll = await prisma.poll.findUnique({
      where: { id: id },
      include: {
        options: true,
        votes: {
          where: {
            userId: session.user.id,
          },
        },
      },
    });

    if (!poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }

    // Check if poll has ended
    if (poll.endsAt && new Date(poll.endsAt) < new Date()) {
      return NextResponse.json({ error: 'Poll has ended' }, { status: 403 });
    }

    // Check if user already voted
    if (poll.votes.length > 0) {
      return NextResponse.json({ error: 'You have already voted on this poll' }, { status: 409 });
    }

    // Check if option belongs to this poll
    const option = poll.options.find((opt) => opt.id === optionId);
    if (!option) {
      return NextResponse.json({ error: 'Invalid option for this poll' }, { status: 400 });
    }

    // Create vote
    const vote = await prisma.pollVote.create({
      data: {
        pollId: id,
        optionId,
        userId: session.user.id,
      },
    });

    return NextResponse.json(vote, { status: 201 });
  } catch (error) {
    console.error('Error voting on poll:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
