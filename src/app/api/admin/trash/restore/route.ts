import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireModerator } from '@/lib/require-permission';
import { restoreItemSchema } from '@/lib/validations/admin';
import { logAdminAction } from '@/features/admin/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const { error, session } = await requireModerator(request);
    if (error) return error;

    const body = await request.json();
    const validation = restoreItemSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed', details: validation.error.issues }, { status: 400 });
    }

    const { id, type } = validation.data;

    let item;
    if (type === 'post') {
      item = await prisma.post.findUnique({ where: { id } });
      if (!item || !item.deletedAt) return NextResponse.json({ error: 'Post not found in trash' }, { status: 404 });
      await prisma.post.update({ where: { id }, data: { deletedAt: null } });
    } else if (type === 'comment') {
      item = await prisma.comment.findUnique({ where: { id } });
      if (!item || !item.deletedAt) return NextResponse.json({ error: 'Comment not found in trash' }, { status: 404 });
      await prisma.comment.update({ where: { id }, data: { deletedAt: null } });
    } else if (type === 'user') {
      item = await prisma.user.findUnique({ where: { id } });
      if (!item || !item.deletedAt) return NextResponse.json({ error: 'User not found in trash' }, { status: 404 });
      await prisma.user.update({ where: { id }, data: { deletedAt: null } });
    }

    await logAdminAction({
      actorId: session!.user.id,
      action: `${type}.restore`,
      targetType: type,
      targetId: id,
    });

    return NextResponse.json({ success: true, id, type });
  } catch (error) {
    console.error('Restore error:', error);
    return NextResponse.json({ error: 'Failed to restore item' }, { status: 500 });
  }
}
