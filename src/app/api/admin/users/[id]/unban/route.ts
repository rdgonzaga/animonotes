import { type NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-permission';
import { logAdminAction } from '@/features/admin/lib/audit';
import { auth } from '@/features/auth/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { error, session } = await requireAdmin(request);
    if (error) return error;

    const result = await auth.api.unbanUser({
      body: { userId: id },
      headers: request.headers,
    });

    await logAdminAction({
      actorId: session!.user.id,
      action: 'user.unban',
      targetType: 'user',
      targetId: id,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Unban user error:', error);
    return NextResponse.json({ error: 'Failed to unban user' }, { status: 500 });
  }
}
