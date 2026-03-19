import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/require-permission';
import { logAdminAction } from '@/features/admin/lib/audit';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { error, session } = await requireAdmin(request);
    if (error) return error;

    const post = await prisma.post.update({ where: { id }, data: { isPinned: true } });

    await logAdminAction({
      actorId: session!.user.id,
      action: 'post.pin',
      targetType: 'post',
      targetId: id,
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Pin post error:', error);
    return NextResponse.json({ error: 'Failed to pin post' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { error, session } = await requireAdmin(request);
    if (error) return error;

    const post = await prisma.post.update({ where: { id }, data: { isPinned: false } });

    await logAdminAction({
      actorId: session!.user.id,
      action: 'post.unpin',
      targetType: 'post',
      targetId: id,
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Unpin post error:', error);
    return NextResponse.json({ error: 'Failed to unpin post' }, { status: 500 });
  }
}
