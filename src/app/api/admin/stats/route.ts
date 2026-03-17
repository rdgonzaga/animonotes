import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireModerator } from '@/lib/require-permission';

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireModerator(request);
    if (error) return error;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      activeUsers,
      bannedUsers,
      totalPosts,
      totalComments,
      pendingReports,
      resolvedReportsToday,
      activeCategories,
      pinnedPosts,
      activeAnnouncements,
      recentActivity,
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { deletedAt: null, banned: false } }),
      prisma.user.count({ where: { banned: true } }),
      prisma.post.count({ where: { deletedAt: null } }),
      prisma.comment.count({ where: { deletedAt: null } }),
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.report.count({ where: { status: 'RESOLVED', createdAt: { gte: today } } }),
      prisma.category.count({ where: { isActive: true } }),
      prisma.post.count({ where: { isPinned: true, deletedAt: null } }),
      prisma.announcement.count({ where: { isActive: true } }),
      prisma.auditLog.findMany({
        include: { actor: { select: { id: true, name: true, email: true, role: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        activeUsers,
        bannedUsers,
        totalPosts,
        totalComments,
        pendingReports,
        resolvedReportsToday,
        activeCategories,
        pinnedPosts,
        activeAnnouncements,
      },
      recentActivity,
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
