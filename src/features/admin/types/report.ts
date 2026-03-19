export type ReportStatus = 'PENDING' | 'RESOLVED' | 'DISMISSED';
export type ReportTargetType = 'post' | 'comment' | 'user';
export type ReportAction = 'delete_post' | 'delete_comment' | 'ban_user' | 'warn_user' | 'dismiss' | 'none';

export interface AdminReport {
  id: string;
  reason: string;
  status: ReportStatus;
  createdAt: string;
  reporter: { id: string; name: string | null; image: string | null };
  post: { id: string; title: string; content: string; author: { id: string; name: string | null } | null } | null;
  comment: { id: string; content: string; author: { id: string; name: string | null } | null } | null;
  reportedUser: { id: string; name: string | null; email: string; image: string | null; banned: boolean } | null;
  reportCount?: number;
}

export interface ReportFilter {
  status: ReportStatus;
  page: number;
  limit: number;
}

export interface ModerationQueueProps {
  initialReports?: AdminReport[];
}

export interface ReportDetailProps {
  report: AdminReport;
  onClose: () => void;
  onAction: (reportId: string, status: ReportStatus, action?: ReportAction, reason?: string) => Promise<void>;
}

export interface ReportActionsProps {
  report: AdminReport;
  onAction: (reportId: string, status: ReportStatus, action?: ReportAction, reason?: string) => Promise<void>;
}
