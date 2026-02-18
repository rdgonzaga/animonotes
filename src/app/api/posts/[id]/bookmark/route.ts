import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/features/auth/lib/auth';

// POST /api/posts/[id]/bookmark - Add bookmark
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: id },
    });

    if (!post || post.deletedAt) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if already bookmarked
    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: id,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Post already bookmarked' }, { status: 409 });
    }

    // Create bookmark
    const bookmark = await prisma.bookmark.create({
      data: {
        userId: session.user.id,
        postId: id,
      },
    });

    return NextResponse.json(bookmark, { status: 201 });
  } catch (error) {
    console.error('Bookmark creation error:', error);
    return NextResponse.json({ error: 'Failed to create bookmark' }, { status: 500 });
  }
}

// DELETE /api/posts/[id]/bookmark - Remove bookmark
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

    await prisma.bookmark.deleteMany({
      where: {
        userId: session.user.id,
        postId: id,
      },
    });

    return NextResponse.json({ message: 'Bookmark removed' });
  } catch (error) {
    console.error('Bookmark deletion error:', error);
    return NextResponse.json({ error: 'Failed to remove bookmark' }, { status: 500 });
  }
}
