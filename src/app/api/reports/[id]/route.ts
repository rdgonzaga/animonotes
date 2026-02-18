import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/features/auth/lib/auth';

// PATCH /api/reports/[id] - Update report status (admin only)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const isAdmin = session?.user?.role?.toLowerCase() === 'admin';
    if (!session?.user || !isAdmin) {
      return NextResponse.json({ error: 'Forbidden - admin only' }, { status: 403 });
    }

    const body = await request.json();
    const { status, action } = body;

    if (!['PENDING', 'RESOLVED', 'DISMISSED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const report = await prisma.report.findUnique({
      where: { id },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Perform action if specified
    if (action === 'delete_post' && report.postId) {
      await prisma.post.update({
        where: { id: report.postId },
        data: { deletedAt: new Date() },
      });
    } else if (action === 'delete_comment' && report.commentId) {
      await prisma.comment.update({
        where: { id: report.commentId },
        data: { deletedAt: new Date() },
      });
    } else if (action === 'ban_user' && report.userId) {
      await prisma.user.update({
        where: { id: report.userId },
        data: {
          deletedAt: new Date(),
          email: `banned_${report.userId}@banned.com`,
          name: '[Banned User]',
        },
      });
    }

    const updatedReport = await prisma.report.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updatedReport);
  } catch (error) {
    console.error('Report update error:', error);
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
  }
}
