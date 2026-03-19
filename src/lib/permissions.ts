// RBAC permissions configuration
// Fallback approach: simple role-based access control via string comparison
// (better-auth/plugins/access may not be available in v1.4.18)

export const ac = null;
export const userRole = null;
export const moderatorRole = null;
export const adminRole = null;

// Role definitions for reference
export const ROLES = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
} as const;

// Permission definitions (for documentation)
export const PERMISSIONS = {
  post: ['create', 'update', 'delete', 'pin', 'restore'] as const,
  comment: ['create', 'delete', 'restore'] as const,
  report: ['view', 'resolve', 'dismiss'] as const,
  category: ['create', 'update', 'delete', 'toggle-active'] as const,
  announcement: ['create', 'update', 'delete'] as const,
  auditLog: ['view'] as const,
  trash: ['view', 'restore', 'hard-delete'] as const,
} as const;
