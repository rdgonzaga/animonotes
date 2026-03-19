export type UserStatus = 'active' | 'banned' | 'deleted';

export interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  banned: boolean;
  banReason: string | null;
  banExpires: string | null;
  deletedAt: string | null;
  createdAt: string;
  postCount: number;
  commentCount: number;
  reportCount: number;
  sessions?: AdminSession[];
}

export interface AdminSession {
  id: string;
  token: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  expiresAt: string;
}

export interface UserFilter {
  search?: string;
  role?: string;
  status?: UserStatus | 'all';
  page: number;
  limit: number;
}

export interface UserManagementProps {
  initialUsers?: AdminUser[];
}

export interface UserDetailProps {
  user: AdminUser;
  onClose: () => void;
  onRoleChange: (userId: string, role: string) => Promise<void>;
  onBan: (userId: string, reason: string, duration?: number) => Promise<void>;
  onUnban: (userId: string) => Promise<void>;
  onRevokeAllSessions: (userId: string) => Promise<void>;
}

export interface RoleAssignmentProps {
  userId: string;
  currentRole: string;
  currentUserId: string;
  onRoleChange: (userId: string, role: string) => Promise<void>;
}
