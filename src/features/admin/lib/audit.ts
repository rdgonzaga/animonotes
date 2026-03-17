import { prisma } from '@/lib/prisma';
import { sseBroadcaster } from '@/lib/sse-broadcaster';

export interface LogAdminActionParams {
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  details?: Record<string, unknown>;
}

/**
 * Log an admin action to the audit trail and broadcast via SSE
 * Call this after every admin mutation (ban, delete, role change, etc.)
 */
export async function logAdminAction(params: LogAdminActionParams) {
  const { actorId, action, targetType, targetId, details } = params;

  const auditLog = await prisma.auditLog.create({
    data: {
      actorId,
      action,
      targetType,
      targetId,
      details: details ? (details as object) : undefined,
    },
  });

  sseBroadcaster.broadcast({
    type: 'audit-log-new',
    data: auditLog,
    channel: 'admin-audit',
  });

  return auditLog;
}
