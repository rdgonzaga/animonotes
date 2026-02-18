import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/features/auth/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendMessageSchema } from '@/lib/validations/message';

// POST /api/conversations/[id]/messages - Send message
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = sendMessageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { content } = validation.data;

    // Check if conversation exists and user is participant
    const conversation = await prisma.conversation.findUnique({
      where: { id: id },
      include: {
        participants: true,
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const isParticipant = conversation.participants.some((p) => p.userId === session.user.id);

    if (!isParticipant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get other participant(s)
    const otherParticipants = conversation.participants.filter((p) => p.userId !== session.user.id);

    // Check for blocks
    for (const participant of otherParticipants) {
      const block = await prisma.block.findFirst({
        where: {
          OR: [
            { blockerId: session.user.id, blockedId: participant.userId },
            { blockerId: participant.userId, blockedId: session.user.id },
          ],
        },
      });

      if (block) {
        return NextResponse.json({ error: 'Cannot send message to this user' }, { status: 403 });
      }
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderId: session.user.id,
        content,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
