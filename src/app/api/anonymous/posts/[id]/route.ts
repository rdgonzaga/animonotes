import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { updateAnonymousPostSchema } from '@/lib/validations/anonymous';

// GET /api/anonymous/posts/[id] - Get single anonymous post
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const post = await prisma.post.findUnique({
      where: {
        id,
        isAnonymous: true,
        authorId: null,
      },
      include: {
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

    // Calculate vote score
    const votes = await prisma.vote.findMany({
      where: { postId: post.id },
      select: { value: true },
    });
    const score = votes.reduce((sum, vote) => sum + vote.value, 0);

    return NextResponse.json({ ...post, score });
  } catch (error) {
    console.error('Anonymous post fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

// PATCH /api/anonymous/posts/[id] - Update anonymous post (cookie ownership check)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Check cookie ownership
    const cookieStore = await cookies();
    const anonPosts = cookieStore.get('anonPosts')?.value || '[]';
    let postIds: string[] = [];
    try {
      postIds = JSON.parse(anonPosts);
    } catch {
      postIds = [];
    }

    if (!postIds.includes(id)) {
      return NextResponse.json(
        { error: "Unauthorized - You don't own this anonymous post" },
        { status: 403 }
      );
    }

    // Verify post exists and is anonymous
    const existingPost = await prisma.post.findUnique({
      where: { id, isAnonymous: true, authorId: null },
    });

    if (!existingPost || existingPost.deletedAt) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const body = await request.json();
    const validation = updateAnonymousPostSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const post = await prisma.post.update({
      where: { id },
      data: validation.data,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Anonymous post update error:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

// DELETE /api/anonymous/posts/[id] - Soft delete anonymous post (cookie ownership check)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check cookie ownership
    const cookieStore = await cookies();
    const anonPosts = cookieStore.get('anonPosts')?.value || '[]';
    let postIds: string[] = [];
    try {
      postIds = JSON.parse(anonPosts);
    } catch {
      postIds = [];
    }

    if (!postIds.includes(id)) {
      return NextResponse.json(
        { error: "Unauthorized - You don't own this anonymous post" },
        { status: 403 }
      );
    }

    // Verify post exists and is anonymous
    const existingPost = await prisma.post.findUnique({
      where: { id, isAnonymous: true, authorId: null },
    });

    if (!existingPost || existingPost.deletedAt) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Soft delete
    await prisma.post.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Remove from cookie
    const updatedPostIds = postIds.filter((postId) => postId !== id);
    cookieStore.set('anonPosts', JSON.stringify(updatedPostIds), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Anonymous post deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
