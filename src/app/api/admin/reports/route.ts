import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireModerator } from '@/lib/require-permission';

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireModerator(request);
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'PENDING';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where: { status },
        include: {
          reporter: { select: { id: true, name: true, image: true } },
          post: {
            select: {
              id: true,
              title: true,
              content: true,
              author: { select: { id: true, name: true } },
            },
          },
          comment: {
            select: {
              id: true,
              content: true,
              author: { select: { id: true, name: true } },
            },
          },
          reportedUser: {
            select: { id: true, name: true, email: true, image: true, banned: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.report.count({ where: { status } }),
    ]);

    return NextResponse.json({ reports, total, page, limit });
  } catch (error) {
    console.error('Admin reports fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}
