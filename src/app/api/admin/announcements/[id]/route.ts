import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/require-permission';
import { updateAnnouncementSchema } from '@/lib/validations/admin';
import { logAdminAction } from '@/features/admin/lib/audit';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { error, session } = await requireAdmin(request);
    if (error) return error;

    const body = await request.json();
    const validation = updateAnnouncementSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed', details: validation.error.issues }, { status: 400 });
    }

    const data: Record<string, unknown> = { ...validation.data };
    if (validation.data.endsAt) data.endsAt = new Date(validation.data.endsAt);
    else if (validation.data.endsAt === null) data.endsAt = null;

    const announcement = await prisma.announcement.update({ where: { id }, data });

    await logAdminAction({
      actorId: session!.user.id,
      action: 'announcement.update',
      targetType: 'announcement',
      targetId: id,
      details: validation.data as Record<string, unknown>,
    });

    return NextResponse.json(announcement);
  } catch (error) {
    console.error('Announcement update error:', error);
    return NextResponse.json({ error: 'Failed to update announcement' }, { status: 500 });
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

    await prisma.announcement.delete({ where: { id } });

    await logAdminAction({
      actorId: session!.user.id,
      action: 'announcement.delete',
      targetType: 'announcement',
      targetId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Announcement delete error:', error);
    return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 });
  }
}
