import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/features/auth/lib/auth';
import { z } from 'zod';

const COLLEGES = ['BAGCED', 'CCS', 'TDSOL', 'CLA', 'COS', 'GCOE', 'COB', 'SOE'] as const;

const updateProfileSchema = z.object({
  college: z.enum(COLLEGES),
  course: z.string().trim().min(1).max(200),
  username: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  biography: z.string().trim().max(500).optional().or(z.literal('')),
});

// GET /api/users/[id] - Get user profile
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
      select: {
        id: true,
        name: true,
        image: true,
        username: true,
        college: true,
        course: true,
        biography: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            comments: true,
            votes: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate karma (simplified: upvotes on user's posts and comments)
    const userPosts = await prisma.post.findMany({
      where: { authorId: id },
      select: {
        votes: {
          select: { value: true },
        },
      },
    });

    const userComments = await prisma.comment.findMany({
      where: { authorId: id },
      select: {
        votes: {
          select: { value: true },
        },
      },
    });

    const karma = [
      ...userPosts.flatMap((p) => p.votes),
      ...userComments.flatMap((c) => c.votes),
    ].reduce((sum, vote) => sum + vote.value, 0);

    return NextResponse.json({
      ...user,
      karma,
    });
  } catch (error) {
    console.error('User fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

// PATCH /api/users/[id] - Update user profile
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.id !== id) {
      return NextResponse.json({ error: 'Forbidden - can only edit own profile' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { college, course, username, biography } = parsed.data;

    try {
      const updatedUser = await prisma.user.update({
        where: { id: id },
        data: {
          college,
          course,
          username,
          biography: biography || null,
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          username: true,
          college: true,
          course: true,
          biography: true,
        },
      });

      return NextResponse.json(updatedUser);
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: string }).code === 'P2002'
      ) {
        return NextResponse.json({ error: 'Username is already taken' }, { status: 409 });
      }

      throw error;
    }
  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
