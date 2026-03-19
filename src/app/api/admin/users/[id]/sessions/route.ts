import { type NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-permission';
import { logAdminAction } from '@/features/admin/lib/audit';
import { auth } from '@/features/auth/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { error } = await requireAdmin(request);
    if (error) return error;

    const sessions = await auth.api.listUserSessions({
      body: { userId: id },
      headers: request.headers,
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('List sessions error:', error);
    return NextResponse.json({ error: 'Failed to list sessions' }, { status: 500 });
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

    await auth.api.revokeUserSessions({
      body: { userId: id },
      headers: request.headers,
    });

    await logAdminAction({
      actorId: session!.user.id,
      action: 'session.revoke',
      targetType: 'user',
      targetId: id,
      details: { scope: 'all' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Revoke sessions error:', error);
    return NextResponse.json({ error: 'Failed to revoke sessions' }, { status: 500 });
  }
}
