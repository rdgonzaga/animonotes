import type { AdminSession } from './user';

export interface AuditLogEntry {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  details: Record<string, unknown> | null;
  createdAt: string;
  actor: { id: string; name: string | null; email: string; role: string };
}

export interface AuditLogFilter {
  action?: string;
  actorId?: string;
  targetType?: string;
  from?: string;
  to?: string;
  page: number;
  limit: number;
}

export interface AuditLogViewerProps {
  initialEntries?: AuditLogEntry[];
}

export interface SessionListProps {
  userId: string;
  sessions: AdminSession[];
  onRevoke: (sessionToken: string) => Promise<void>;
  onRevokeAll: (userId: string) => Promise<void>;
}
