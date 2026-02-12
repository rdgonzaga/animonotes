import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/polls/[id]/results - Get poll results
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const poll = await prisma.poll.findUnique({
      where: { id: id },
      include: {
        options: {
          include: {
            _count: {
              select: {
                votes: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
        _count: {
          select: {
            votes: true,
          },
        },
      },
    });

    if (!poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }

    const totalVotes = poll._count.votes;

    const results = {
      id: poll.id,
      question: poll.question,
      endsAt: poll.endsAt,
      totalVotes,
      options: poll.options.map((option) => ({
        id: option.id,
        text: option.text,
        voteCount: option._count.votes,
        percentage: totalVotes > 0 ? (option._count.votes / totalVotes) * 100 : 0,
      })),
    };

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching poll results:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
