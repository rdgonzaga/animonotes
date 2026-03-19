import type { ReactNode } from 'react';

export interface AdminSidebarLink {
  href: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

export interface AdminSidebarProps {
  userRole: string;
}

export interface AdminLayoutProps {
  children: ReactNode;
}

export interface AdminOverviewStats {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  totalPosts: number;
  totalComments: number;
  pendingReports: number;
  resolvedReportsToday: number;
  activeCategories: number;
  pinnedPosts: number;
  activeAnnouncements: number;
}
