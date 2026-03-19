import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireModerator } from '@/lib/require-permission';
import { updateReportStatusSchema } from '@/lib/validations/admin';
import { logAdminAction } from '@/features/admin/lib/audit';
import { auth } from '@/features/auth/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { error, session } = await requireModerator(request);
    if (error) return error;

    const body = await request.json();
    const validation = updateReportStatusSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed', details: validation.error.issues }, { status: 400 });
    }

    const { status, action } = validation.data;

    const report = await prisma.report.findUnique({ where: { id } });
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Self-ban protection
    if (action === 'ban_user' && report.userId === session!.user.id) {
      return NextResponse.json({ error: 'Cannot self-ban: report targets yourself' }, { status: 400 });
    }

    // Perform action
    if (action === 'delete_post' && report.postId) {
      await prisma.post.update({ where: { id: report.postId }, data: { deletedAt: new Date() } });
    } else if (action === 'delete_comment' && report.commentId) {
      await prisma.comment.update({ where: { id: report.commentId }, data: { deletedAt: new Date() } });
    } else if (action === 'ban_user' && report.userId) {
      try {
        await auth.api.banUser({
          body: { userId: report.userId, banReason: validation.data.reason || 'Banned via report' },
          headers: request.headers,
        });
      } catch {
        // Fallback to manual ban if Better Auth banUser fails
        await prisma.user.update({
          where: { id: report.userId },
          data: {
            banned: true,
            banReason: validation.data.reason || 'Banned via report',
          },
        });
      }
    }

    const updated = await prisma.report.update({ where: { id }, data: { status } });

    await logAdminAction({
      actorId: session!.user.id,
      action: `report.${status.toLowerCase()}`,
      targetType: 'report',
      targetId: id,
      details: { action: action || 'none', status },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Report update error:', error);
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
  }
}
