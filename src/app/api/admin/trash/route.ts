import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireModerator } from '@/lib/require-permission';

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireModerator(request);
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let posts: { id: string; title: string; deletedAt: Date | null; author: { name: string | null } | null }[] = [];
    let comments: { id: string; content: string; deletedAt: Date | null; author: { name: string | null } | null }[] = [];
    let users: { id: string; name: string | null; email: string; deletedAt: Date | null }[] = [];
    let total = 0;

    if (type === 'all' || type === 'post') {
      posts = await prisma.post.findMany({
        where: { deletedAt: { not: null } },
        select: { id: true, title: true, deletedAt: true, author: { select: { name: true } } },
        orderBy: { deletedAt: 'desc' },
        skip: type === 'post' ? skip : 0,
        take: type === 'post' ? limit : 100,
      });
      if (type === 'post') total = await prisma.post.count({ where: { deletedAt: { not: null } } });
    }

    if (type === 'all' || type === 'comment') {
      comments = await prisma.comment.findMany({
        where: { deletedAt: { not: null } },
        select: { id: true, content: true, deletedAt: true, author: { select: { name: true } } },
        orderBy: { deletedAt: 'desc' },
        skip: type === 'comment' ? skip : 0,
        take: type === 'comment' ? limit : 100,
      });
      if (type === 'comment') total = await prisma.comment.count({ where: { deletedAt: { not: null } } });
    }

    if (type === 'all' || type === 'user') {
      users = await prisma.user.findMany({
        where: { deletedAt: { not: null } },
        select: { id: true, name: true, email: true, deletedAt: true },
        orderBy: { deletedAt: 'desc' },
        skip: type === 'user' ? skip : 0,
        take: type === 'user' ? limit : 100,
      });
      if (type === 'user') total = await prisma.user.count({ where: { deletedAt: { not: null } } });
    }

    const mapItem = (
      item: { id: string; deletedAt: Date | null },
      itemType: string,
      preview: string,
      authorName?: string | null,
    ) => {
      const deletedAt = item.deletedAt!;
      const ageInDays = Math.floor((now.getTime() - deletedAt.getTime()) / (1000 * 60 * 60 * 24));
      return {
        id: item.id,
        type: itemType,
        preview,
        deletedAt: deletedAt.toISOString(),
        ageInDays,
        canHardDelete: deletedAt < thirtyDaysAgo,
        authorName: authorName || null,
      };
    };

    const items = [
      ...posts.map((p) => mapItem(p, 'post', p.title, p.author?.name)),
      ...comments.map((c) => mapItem(c, 'comment', c.content.substring(0, 100), c.author?.name)),
      ...users.map((u) => mapItem(u, 'user', u.name || u.email, null)),
    ].sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());

    if (type === 'all') total = items.length;

    return NextResponse.json({
      items: type === 'all' ? items.slice(skip, skip + limit) : items,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error('Trash bin fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch trash' }, { status: 500 });
  }
}
