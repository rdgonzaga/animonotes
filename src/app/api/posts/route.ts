import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/features/auth/lib/auth';
import { createPostSchema } from '@/lib/validations/post';

// GET /api/posts - List posts with pagination, filtering, and sorting
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageParam = Number(searchParams.get('page') || '1');
    const limitParam = Number(searchParams.get('limit') || '10');
    const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
    const limit = Number.isFinite(limitParam)
      ? Math.min(Math.max(Math.floor(limitParam), 1), 50)
      : 10;
    const categorySlug = searchParams.get('category');
    const sortBy = (searchParams.get('sortBy') as 'newest' | 'most-voted' | 'most-commented' | 'trending') || 'newest';

    const where = {
      deletedAt: null,
      ...(categorySlug && {
        category: {
          slug: categorySlug,
        },
      }),
    };

    // Determine orderBy based on sortBy parameter
    let orderBy: any = { createdAt: 'desc' }; // default

    if (sortBy === 'most-commented') {
      // Fetch all matching posts and sort by comment count in memory
      // (Prisma limitation: can't easily orderBy aggregations without raw SQL)
    } else if (sortBy === 'most-voted' || sortBy === 'trending') {
      // Will sort by vote score in memory
    }

    // Fetch posts - get more than needed for sorting
    const allPosts = await prisma.post.findMany({
      where,
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
        votes: {
          select: {
            value: true,
          },
        },
      },
    });

    // Calculate scores for all posts
    const postsWithScores = allPosts.map((post) => ({
      ...post,
      score: post.votes.reduce((sum, vote) => sum + vote.value, 0),
      votes: undefined,
    }));

    // Apply server-side sorting
    let sortedPosts = [...postsWithScores];
    switch (sortBy) {
      case 'most-voted':
      case 'trending':
        sortedPosts.sort((a, b) => b.score - a.score);
        break;
      case 'most-commented':
        sortedPosts.sort((a, b) => (b._count?.comments || 0) - (a._count?.comments || 0));
        break;
      case 'newest':
      default:
        sortedPosts.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    // Apply pagination after sorting
    const total = sortedPosts.length;
    const skip = (page - 1) * limit;
    const paginatedPosts = sortedPosts.slice(skip, skip + limit);

    return NextResponse.json(
      {
        posts: paginatedPosts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    console.error('Posts fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

// POST /api/posts - Create new post
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createPostSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { title, content, categoryId, isAnonymous } = validation.data;

    const post = await prisma.post.create({
      data: {
        title,
        content,
        categoryId,
        authorId: isAnonymous ? null : session.user.id,
        isAnonymous,
      },
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

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Post creation error:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
