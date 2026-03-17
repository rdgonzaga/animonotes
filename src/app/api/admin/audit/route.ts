import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireModerator } from '@/lib/require-permission';
import { auditLogFilterSchema } from '@/lib/validations/admin';

export async function GET(request: NextRequest) {
  try {
    const { error, session } = await requireModerator(request);
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const validation = auditLogFilterSchema.safeParse(Object.fromEntries(searchParams.entries()));
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid filters' }, { status: 400 });
    }

    const { action, actorId, targetType, from, to, page, limit } = validation.data;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (action) where.action = { contains: action };
    if (actorId) where.actorId = actorId;
    if (targetType) where.targetType = targetType;
    if (from || to) {
      where.createdAt = {};
      if (from) (where.createdAt as Record<string, Date>).gte = new Date(from);
      if (to) (where.createdAt as Record<string, Date>).lte = new Date(to);
    }

    // Moderators see only content-related actions
    const role = (session!.user as Record<string, unknown>).role as string;
    if (role === 'moderator') {
      where.action = { startsWith: 'report.' };
    }

    const [entries, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { actor: { select: { id: true, name: true, email: true, role: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json({ entries, total, page, limit });
  } catch (error) {
    console.error('Audit log fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch audit log' }, { status: 500 });
  }
}
