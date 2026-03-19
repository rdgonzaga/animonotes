import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/search - Search posts and users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'all'; // all, posts, users

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const searchTerm = query.trim();
    const results: any = {
      posts: [],
      users: [],
    };

    // Search posts
    if (type === 'all' || type === 'posts') {
      const posts = await prisma.post.findMany({
        where: {
          deletedAt: null,
          OR: [
            {
              title: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
            {
              content: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          ],
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
          _count: {
            select: {
              comments: true,
              votes: true,
            },
          },
        },
        take: 20,
        orderBy: {
          createdAt: 'desc',
        },
      });

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

      results.posts = postsWithScores;
    }

    // Search users
    if (type === 'all' || type === 'users') {
      const users = await prisma.user.findMany({
        where: {
          deletedAt: null,
          OR: [
            {
              name: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
            {
              username: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          ],
        },
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          createdAt: true,
          _count: {
            select: {
              posts: true,
              comments: true,
            },
          },
        },
        take: 10,
      });

      results.users = users;
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
