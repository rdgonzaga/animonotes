import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/bookmarks/ids - Get just the post IDs the user has bookmarked (lightweight)
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: session.user.id },
      select: { postId: true },
    });

    const postIds = bookmarks.map((b) => b.postId);
    return NextResponse.json(postIds);
  } catch (error) {
    console.error('Bookmark IDs fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch bookmark IDs' }, { status: 500 });
  }
}
