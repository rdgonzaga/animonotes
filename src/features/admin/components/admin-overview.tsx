'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Shield, Users, FolderTree, ScrollText, Megaphone, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { AdminOverviewStats, AuditLogEntry } from '../types';

interface StatsData {
  stats: AdminOverviewStats;
  recentActivity: AuditLogEntry[];
}

export function AdminOverview() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats;

  const statCards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers,
      icon: Users,
      href: '/admin/users',
      color: 'text-blue-600',
      highlight: false,
    },
    {
      label: 'Pending Reports',
      value: stats?.pendingReports,
      icon: Shield,
      href: '/admin/reports',
      color: stats?.pendingReports ? 'text-red-600' : 'text-green-600',
      highlight: !!stats?.pendingReports,
    },
    {
      label: 'Active Posts',
      value: stats?.totalPosts,
      icon: TrendingUp,
      href: '/posts',
      color: 'text-primary',
      highlight: false,
    },
    {
      label: 'Banned Users',
      value: stats?.bannedUsers,
      icon: AlertTriangle,
      href: '/admin/users?status=banned',
      color: 'text-orange-600',
      highlight: false,
    },
    {
      label: 'Active Categories',
      value: stats?.activeCategories,
      icon: FolderTree,
      href: '/admin/categories',
      color: 'text-purple-600',
      highlight: false,
    },
    {
      label: 'Active Announcements',
      value: stats?.activeAnnouncements,
      icon: Megaphone,
      href: '/admin/announcements',
      color: 'text-blue-600',
      highlight: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-sans font-bold text-primary">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of AnimoNotes platform activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card
              className={`hover:shadow-md transition-shadow cursor-pointer ${card.highlight ? 'border-red-200 dark:border-red-800' : ''}`}
            >
              <CardContent className="p-4">
                {loading ? (
                  <Skeleton className="h-12 w-full" />
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        {card.label}
                      </p>
                      <p className={`text-2xl font-bold mt-1 ${card.color}`}>
                        {card.value ?? '—'}
                      </p>
                    </div>
                    <card.icon className={`h-8 w-8 opacity-20 ${card.color}`} />
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      {stats?.pendingReports ? (
        <Card className="border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/10">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="font-medium text-sm">
                  {stats.pendingReports} pending report
                  {stats.pendingReports !== 1 ? 's' : ''} need attention
                </p>
                <p className="text-xs text-muted-foreground">
                  Review and take action on flagged content
                </p>
              </div>
            </div>
            <Link href="/admin/reports">
              <Button size="sm" variant="outline" className="border-orange-300">
                View Reports
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : null}

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ScrollText className="h-4 w-4" /> Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : !data?.recentActivity?.length ? (
            <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
          ) : (
            <div className="space-y-2">
              {data.recentActivity.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{entry.actor.name || '[Admin]'}</span>
                    <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                      {entry.action}
                    </span>
                    <span className="text-muted-foreground capitalize">{entry.targetType}</span>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-3 pt-3 border-t">
            <Link href="/admin/audit">
              <Button variant="ghost" size="sm" className="w-full">
                View Full Audit Log
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
