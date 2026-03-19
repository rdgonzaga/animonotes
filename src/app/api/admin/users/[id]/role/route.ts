import { z } from 'zod';
import { type NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-permission';
import { logAdminAction } from '@/features/admin/lib/audit';
import { prisma } from '@/lib/prisma';

const SINGLE_ADMIN_EMAIL = 'rainer_gonzaga@dlsu.edu.ph';

const roleBodySchema = z.object({
  role: z.enum(['user', 'moderator', 'admin']),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { error, session } = await requireAdmin(request);
    if (error) return error;

    const body = await request.json();
    const validation = roleBodySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    // Prevent self-role-removal
    if (id === session!.user.id && validation.data.role !== 'admin') {
      return NextResponse.json({ error: 'Cannot remove your own admin role' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (targetUser.email === SINGLE_ADMIN_EMAIL && validation.data.role !== 'admin') {
      return NextResponse.json(
        { error: 'Cannot remove admin privileges from the designated admin account' },
        { status: 400 }
      );
    }

    if (validation.data.role === 'admin' && targetUser.email !== SINGLE_ADMIN_EMAIL) {
      return NextResponse.json(
        { error: `Only ${SINGLE_ADMIN_EMAIL} can have admin privileges` },
        { status: 400 }
      );
    }

    const result = await prisma.user.update({
      where: { id },
      data: { role: validation.data.role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    await logAdminAction({
      actorId: session!.user.id,
      action: 'user.set-role',
      targetType: 'user',
      targetId: id,
      details: { newRole: validation.data.role },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Set role error:', error);
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
  }
}
