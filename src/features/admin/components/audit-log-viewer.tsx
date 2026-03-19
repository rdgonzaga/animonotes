'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ScrollText, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import type { AuditLogEntry } from '../types';

const ACTION_COLORS: Record<string, string> = {
  'user.ban': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  'user.unban': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'user.set-role': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  'post.delete': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  'post.restore': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'post.pin': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'report.resolved': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'report.dismissed': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
  'category.create': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'category.delete': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  'announcement.create': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'session.revoke': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
};

export function AuditLogViewer() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [targetTypeFilter, setTargetTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (actionFilter) params.set('action', actionFilter);
      if (targetTypeFilter !== 'all') params.set('targetType', targetTypeFilter);
      const res = await fetch(`/api/admin/audit?${params}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries);
        setTotal(data.total);
      }
    } catch {
      setError('Failed to load audit log');
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter, targetTypeFilter]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const getActionColor = (action: string) =>
    ACTION_COLORS[action] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-primary">Audit Log</h1>
        <p className="text-sm text-muted-foreground mt-1">Read-only record of all administrative actions</p>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">{error}</div>
      )}

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Filter by action (e.g. user.ban)..."
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          className="flex-1 min-w-[200px]"
        />
        <Select
          value={targetTypeFilter}
          onValueChange={(v) => {
            setTargetTypeFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Target type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="post">Post</SelectItem>
            <SelectItem value="comment">Comment</SelectItem>
            <SelectItem value="report">Report</SelectItem>
            <SelectItem value="category">Category</SelectItem>
            <SelectItem value="announcement">Announcement</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <ScrollText className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-lg font-medium">No audit entries found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <>
                    <TableRow
                      key={entry.id}
                      className="cursor-pointer"
                      onClick={() => setExpandedRow(expandedRow === entry.id ? null : entry.id)}
                    >
                      <TableCell>
                        {expandedRow === entry.id ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{entry.actor.name || '[No name]'}</p>
                          <p className="text-xs text-muted-foreground capitalize">{entry.actor.role}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-xs font-mono px-2 py-0.5 rounded-full ${getActionColor(entry.action)}`}
                        >
                          {entry.action}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <span className="capitalize">{entry.targetType}</span>
                        <span className="text-xs ml-1 font-mono opacity-60">
                          {entry.targetId.substring(0, 8)}...
                        </span>
                      </TableCell>
                    </TableRow>
                    {expandedRow === entry.id && entry.details && (
                      <TableRow key={`${entry.id}-details`}>
                        <TableCell colSpan={5} className="bg-muted/30 py-2 px-4">
                          <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                            {JSON.stringify(entry.details, null, 2)}
                          </pre>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {total > 20 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page * 20 >= total}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
