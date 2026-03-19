import { z } from 'zod';
import { type NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-permission';
import { logAdminAction } from '@/features/admin/lib/audit';
import { auth } from '@/features/auth/lib/auth';

const banBodySchema = z.object({
  reason: z.string().min(10).max(500),
  duration: z.number().positive().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { error, session } = await requireAdmin(request);
    if (error) return error;

    // Self-ban protection
    if (id === session!.user.id) {
      return NextResponse.json({ error: 'Cannot ban yourself' }, { status: 400 });
    }

    const body = await request.json();
    const validation = banBodySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed', details: validation.error.issues }, { status: 400 });
    }

    const { reason, duration } = validation.data;
    const result = await auth.api.banUser({
      body: {
        userId: id,
        banReason: reason,
        banExpiresIn: duration ? duration * 24 * 60 * 60 : undefined,
      },
      headers: request.headers,
    });

    await logAdminAction({
      actorId: session!.user.id,
      action: 'user.ban',
      targetType: 'user',
      targetId: id,
      details: { reason, duration: duration || 'permanent' },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Ban user error:', error);
    return NextResponse.json({ error: 'Failed to ban user' }, { status: 500 });
  }
}
