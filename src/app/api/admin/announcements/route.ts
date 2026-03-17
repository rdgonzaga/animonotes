import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/require-permission';
import { createAnnouncementSchema } from '@/lib/validations/admin';
import { logAdminAction } from '@/features/admin/lib/audit';

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin(request);
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '20', 10));
    const skip = (page - 1) * limit;

    const [announcements, total] = await Promise.all([
      prisma.announcement.findMany({
        include: { creator: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.announcement.count(),
    ]);

    return NextResponse.json({ announcements, total, page, limit });
  } catch (error) {
    console.error('Announcements fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error, session } = await requireAdmin(request);
    if (error) return error;

    const body = await request.json();
    const validation = createAnnouncementSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed', details: validation.error.issues }, { status: 400 });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title: validation.data.title,
        content: validation.data.content,
        type: validation.data.type,
        endsAt: validation.data.endsAt ? new Date(validation.data.endsAt) : null,
        createdBy: session!.user.id,
      },
      include: { creator: { select: { id: true, name: true } } },
    });

    await logAdminAction({
      actorId: session!.user.id,
      action: 'announcement.create',
      targetType: 'announcement',
      targetId: announcement.id,
      details: { title: announcement.title, type: announcement.type },
    });

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    console.error('Announcement create error:', error);
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
  }
}
