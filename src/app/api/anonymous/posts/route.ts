import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { createAnonymousPostSchema } from '@/lib/validations/anonymous';

// GET /api/anonymous/posts - List anonymous posts with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const categorySlug = searchParams.get('category');
    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      isAnonymous: true, // Only anonymous posts
      authorId: null, // Ensure truly anonymous
      ...(categorySlug && {
        category: {
          slug: categorySlug,
        },
      }),
    };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
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
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    // Calculate vote scores
    const postsWithScores = await Promise.all(
      posts.map(async (post) => {
        const votes = await prisma.vote.findMany({
          where: { postId: post.id },
          select: { value: true },
        });
        const score = votes.reduce((sum, vote) => sum + vote.value, 0);
        return { ...post, score };
      })
    );

    return NextResponse.json({
      posts: postsWithScores,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Anonymous posts fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch anonymous posts' }, { status: 500 });
  }
}

// POST /api/anonymous/posts - Create anonymous post (no auth required, tracked by cookie)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = createAnonymousPostSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { title, content, categoryId } = validation.data;

    // Create anonymous post with no author
    const post = await prisma.post.create({
      data: {
        title,
        content,
        categoryId,
        authorId: null, // TRUE anonymity
        isAnonymous: true,
      },
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

    // Store post ID in cookie for edit/delete rights
    const cookieStore = await cookies();
    const anonPosts = cookieStore.get('anonPosts')?.value || '[]';
    let postIds: string[] = [];
    try {
      postIds = JSON.parse(anonPosts);
    } catch {
      postIds = [];
    }
    postIds.push(post.id);

    cookieStore.set('anonPosts', JSON.stringify(postIds), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Anonymous post creation error:', error);
    return NextResponse.json({ error: 'Failed to create anonymous post' }, { status: 500 });
  }
}
