import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/features/auth/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/users/[id]/block - Block user
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Cannot block yourself
    if (id === session.user.id) {
      return NextResponse.json({ error: 'Cannot block yourself' }, { status: 400 });
    }

    // Check if user exists
    const userToBlock = await prisma.user.findUnique({
      where: { id: id },
    });

    if (!userToBlock) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if already blocked
    const existingBlock = await prisma.block.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: session.user.id,
          blockedId: id,
        },
      },
    });

    if (existingBlock) {
      return NextResponse.json({ error: 'User already blocked' }, { status: 409 });
    }

    // Create block
    const block = await prisma.block.create({
      data: {
        blockerId: session.user.id,
        blockedId: id,
      },
    });

    return NextResponse.json(block, { status: 201 });
  } catch (error) {
    console.error('Error blocking user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/users/[id]/block - Unblock user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find and delete block
    const block = await prisma.block.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: session.user.id,
          blockedId: id,
        },
      },
    });

    if (!block) {
      return NextResponse.json({ error: 'User not blocked' }, { status: 404 });
    }

    await prisma.block.delete({
      where: {
        id: block.id,
      },
    });

    return NextResponse.json({ message: 'User unblocked' });
  } catch (error) {
    console.error('Error unblocking user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
