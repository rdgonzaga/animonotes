import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createConversationSchema } from "@/lib/validations/message";

// GET /api/conversations - List user's conversations
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Filter out conversations with blocked users
    const blocks = await prisma.block.findMany({
      where: {
        OR: [
          { blockerId: session.user.id },
          { blockedId: session.user.id },
        ],
      },
    });

    const blockedUserIds = new Set([
      ...blocks.filter(b => b.blockerId === session.user.id).map(b => b.blockedId),
      ...blocks.filter(b => b.blockedId === session.user.id).map(b => b.blockerId),
    ]);

    const filteredConversations = conversations.filter(conv => {
      const otherParticipants = conv.participants.filter(p => p.userId !== session.user.id);
      return !otherParticipants.some(p => blockedUserIds.has(p.userId));
    });

    return NextResponse.json(filteredConversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/conversations - Create new conversation
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = createConversationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { recipientId } = validation.data;

    // Cannot message yourself
    if (recipientId === session.user.id) {
      return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });
    }

    // Check if recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
    });

    if (!recipient) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check for blocks
    const block = await prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: session.user.id, blockedId: recipientId },
          { blockerId: recipientId, blockedId: session.user.id },
        ],
      },
    });

    if (block) {
      return NextResponse.json(
        { error: "Cannot message this user" },
        { status: 403 }
      );
    }

    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            participants: {
              some: {
                userId: session.user.id,
              },
            },
          },
          {
            participants: {
              some: {
                userId: recipientId,
              },
            },
          },
        ],
      },
      include: {
        participants: true,
      },
    });

    // Only return existing if it's a 2-person conversation
    if (existingConversation && existingConversation.participants.length === 2) {
      return NextResponse.json(existingConversation);
    }

    // Rate limiting: Check conversations created in last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentConversations = await prisma.conversation.count({
      where: {
        createdAt: {
          gte: oneHourAgo,
        },
        participants: {
          some: {
            userId: session.user.id,
          },
        },
      },
    });

    if (recentConversations >= 20) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Maximum 20 new conversations per hour." },
        { status: 429 }
      );
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [
            { userId: session.user.id },
            { userId: recipientId },
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        messages: true,
      },
    });

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
