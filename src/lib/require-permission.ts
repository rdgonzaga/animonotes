import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/features/auth/lib/auth';

type Role = 'admin' | 'moderator' | 'user';

export async function requireAdmin(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      session: null,
    };
  }
  const role = session.user.role as string;
  if (role !== 'admin') {
    return {
      error: NextResponse.json(
        { error: 'Forbidden — admin only' },
        { status: 403 },
      ),
      session: null,
    };
  }
  return { error: null, session };
}

export async function requireModerator(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      session: null,
    };
  }
  const role = session.user.role as string;
  if (role !== 'admin' && role !== 'moderator') {
    return {
      error: NextResponse.json(
        { error: 'Forbidden — moderator or admin required' },
        { status: 403 },
      ),
      session: null,
    };
  }
  return { error: null, session };
}

export async function requirePermission(
  request: NextRequest,
  _permissions: Record<string, string[]>,
) {
  // Simple role-based check (no granular permissions needed for this implementation)
  return requireAdmin(request);
}
