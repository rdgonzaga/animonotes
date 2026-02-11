import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { updatePostSchema } from '@/lib/validations/post';

// GET /api/posts/[id] - Get single post
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            comments: true,
            votes: true,
          },
        },
      },
    });

    if (!post || post.deletedAt) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const voteSum = await prisma.vote.aggregate({
      where: { postId: post.id },
      _sum: { value: true },
    });
    const score = voteSum._sum.value ?? 0;

    return NextResponse.json({ ...post, score });
  } catch (error) {
    console.error('Post fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

// PATCH /api/posts/[id] - Update post
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: { id: params.id },
    });

    if (!post || post.deletedAt) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden - can only edit own posts' }, { status: 403 });
    }

    const body = await request.json();
    const validation = updatePostSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const updatedPost = await prisma.post.update({
      where: { id: params.id },
      data: validation.data,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Post update error:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

// DELETE /api/posts/[id] - Soft delete post
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: { id: params.id },
    });

    if (!post || post.deletedAt) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const isAdmin = session.user.role?.toLowerCase() === 'admin';
    if (post.authorId !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden - can only delete own posts' }, { status: 403 });
    }

    await prisma.post.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Post deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
