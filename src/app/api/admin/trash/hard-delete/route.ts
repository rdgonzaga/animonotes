import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/require-permission';
import { hardDeleteSchema } from '@/lib/validations/admin';
import { logAdminAction } from '@/features/admin/lib/audit';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const { error, session } = await requireAdmin(request);
    if (error) return error;

    const body = await request.json();
    const validation = hardDeleteSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed', details: validation.error.issues }, { status: 400 });
    }

    const { ids, type } = validation.data;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - THIRTY_DAYS_MS);

    // Validate all items are eligible for hard delete (> 30 days old)
    for (const id of ids) {
      let item: { deletedAt: Date | null } | null = null;
      if (type === 'post') item = await prisma.post.findUnique({ where: { id }, select: { deletedAt: true } });
      else if (type === 'comment')
        item = await prisma.comment.findUnique({ where: { id }, select: { deletedAt: true } });
      else if (type === 'user') item = await prisma.user.findUnique({ where: { id }, select: { deletedAt: true } });

      if (!item?.deletedAt) {
        return NextResponse.json({ error: `Item ${id} not found in trash` }, { status: 404 });
      }
      if (item.deletedAt > thirtyDaysAgo) {
        return NextResponse.json(
          { error: `Item ${id} must be in trash for at least 30 days before hard delete` },
          { status: 400 },
        );
      }
    }

    // Perform hard delete
    if (type === 'post')
      await prisma.post.deleteMany({ where: { id: { in: ids }, deletedAt: { lt: thirtyDaysAgo } } });
    else if (type === 'comment')
      await prisma.comment.deleteMany({ where: { id: { in: ids }, deletedAt: { lt: thirtyDaysAgo } } });
    else if (type === 'user')
      await prisma.user.deleteMany({ where: { id: { in: ids }, deletedAt: { lt: thirtyDaysAgo } } });

    await logAdminAction({
      actorId: session!.user.id,
      action: `${type}.hard-delete`,
      targetType: type,
      targetId: ids.join(','),
      details: { count: ids.length, ids },
    });

    return NextResponse.json({ success: true, deleted: ids.length });
  } catch (error) {
    console.error('Hard delete error:', error);
    return NextResponse.json({ error: 'Failed to hard delete items' }, { status: 500 });
  }
}
