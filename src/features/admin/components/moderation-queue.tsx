'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Shield, Eye, Trash2, UserX, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useSSE } from '@/hooks/useSSE';
import type { AdminReport, ReportStatus } from '../types';

export function ModerationQueue() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<ReportStatus>('PENDING');
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<AdminReport | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    reportId: string;
    action: string;
    label: string;
  } | null>(null);
  const [error, setError] = useState('');

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?status=${status}&page=${page}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports);
        setTotal(data.total);
      }
    } catch {
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Real-time updates
  useSSE('report-updated', () => fetchReports(), { channels: ['admin-reports'] });

  const handleAction = async (reportId: string, newStatus: ReportStatus, action?: string) => {
    setActionLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, action: action || 'none' }),
      });
      if (res.ok) {
        setReports((prev) => prev.filter((r) => r.id !== reportId));
        setTotal((prev) => prev - 1);
        setSelectedReport(null);
        setConfirmAction(null);
      } else {
        const data = await res.json();
        setError(data.error || 'Action failed');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const getTargetLabel = (report: AdminReport) => {
    if (report.post) return `Post: "${report.post.title.substring(0, 40)}..."`;
    if (report.comment) return `Comment: "${report.comment.content.substring(0, 40)}..."`;
    if (report.reportedUser) return `User: ${report.reportedUser.name || report.reportedUser.email}`;
    return 'Unknown target';
  };

  const getTargetType = (report: AdminReport) => {
    if (report.post) return 'post';
    if (report.comment) return 'comment';
    if (report.reportedUser) return 'user';
    return 'unknown';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-sans font-bold text-primary">Moderation Queue</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review and act on flagged content and user reports
          </p>
        </div>
        <Badge variant={status === 'PENDING' && total > 0 ? 'destructive' : 'secondary'}>
          {total} {status.toLowerCase()}
        </Badge>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">{error}</div>
      )}

      <Tabs
        value={status}
        onValueChange={(v) => {
          setStatus(v as ReportStatus);
          setPage(1);
        }}
      >
        <TabsList>
          <TabsTrigger value="PENDING">Pending</TabsTrigger>
          <TabsTrigger value="RESOLVED">Resolved</TabsTrigger>
          <TabsTrigger value="DISMISSED">Dismissed</TabsTrigger>
        </TabsList>

        <TabsContent value={status} className="mt-4">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : reports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mb-3 opacity-30" />
                  <p className="text-lg font-medium">No {status.toLowerCase()} reports</p>
                  <p className="text-sm">All clear!</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Reporter</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {getTargetType(report)}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm">
                          {getTargetLabel(report)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {report.reporter.name || 'Anonymous'}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                          {report.reason}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedReport(report)}
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {status === 'PENDING' && (
                              <>
                                {report.post && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-orange-600 hover:text-orange-700"
                                    onClick={() =>
                                      setConfirmAction({
                                        reportId: report.id,
                                        action: 'delete_post',
                                        label: 'Hide Post',
                                      })
                                    }
                                    title="Hide post"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                                {report.comment && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-orange-600 hover:text-orange-700"
                                    onClick={() =>
                                      setConfirmAction({
                                        reportId: report.id,
                                        action: 'delete_comment',
                                        label: 'Hide Comment',
                                      })
                                    }
                                    title="Hide comment"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                                {report.reportedUser && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                    onClick={() =>
                                      setConfirmAction({
                                        reportId: report.id,
                                        action: 'ban_user',
                                        label: 'Suspend User',
                                      })
                                    }
                                    title="Suspend user"
                                  >
                                    <UserX className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-600 hover:text-green-700"
                                  onClick={() => handleAction(report.id, 'DISMISSED', 'none')}
                                  title="Dismiss report"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {total > 20 && (
            <div className="flex items-center justify-between mt-4">
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
        </TabsContent>
      </Tabs>

      {/* Report Detail Dialog */}
      {selectedReport && (
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Report Details
              </DialogTitle>
              <DialogDescription>
                Reported{' '}
                {formatDistanceToNow(new Date(selectedReport.createdAt), { addSuffix: true })} by{' '}
                {selectedReport.reporter.name || 'Anonymous'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Reason</p>
                <p className="text-sm bg-muted p-3 rounded-md">{selectedReport.reason}</p>
              </div>
              {selectedReport.post && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Reported Post</p>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="font-medium text-sm">{selectedReport.post.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      by {selectedReport.post.author?.name || 'Anonymous'}
                    </p>
                  </div>
                </div>
              )}
              {selectedReport.comment && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Reported Comment</p>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm">{selectedReport.comment.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      by {selectedReport.comment.author?.name || 'Anonymous'}
                    </p>
                  </div>
                </div>
              )}
              {selectedReport.reportedUser && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Reported User</p>
                  <div className="bg-muted p-3 rounded-md flex items-center gap-3">
                    <div>
                      <p className="font-medium text-sm">
                        {selectedReport.reportedUser.name || '[No name]'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedReport.reportedUser.email}
                      </p>
                    </div>
                    {selectedReport.reportedUser.banned && (
                      <Badge variant="destructive" className="ml-auto">
                        Banned
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              {selectedReport.status === 'PENDING' && (
                <div className="flex gap-2 pt-2 border-t">
                  {selectedReport.post && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-orange-600 border-orange-200"
                      onClick={() => {
                        setSelectedReport(null);
                        setConfirmAction({
                          reportId: selectedReport.id,
                          action: 'delete_post',
                          label: 'Hide Post',
                        });
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Hide Post
                    </Button>
                  )}
                  {selectedReport.comment && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-orange-600 border-orange-200"
                      onClick={() => {
                        setSelectedReport(null);
                        setConfirmAction({
                          reportId: selectedReport.id,
                          action: 'delete_comment',
                          label: 'Hide Comment',
                        });
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Hide Comment
                    </Button>
                  )}
                  {selectedReport.reportedUser && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200"
                      onClick={() => {
                        setSelectedReport(null);
                        setConfirmAction({
                          reportId: selectedReport.id,
                          action: 'ban_user',
                          label: 'Suspend User',
                        });
                      }}
                    >
                      <UserX className="h-4 w-4 mr-1" /> Suspend User
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto"
                    onClick={() => handleAction(selectedReport.id, 'DISMISSED', 'none')}
                    disabled={actionLoading}
                  >
                    <XCircle className="h-4 w-4 mr-1" /> Dismiss
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Confirm Destructive Action */}
      {confirmAction && (
        <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Confirm: {confirmAction.label}
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action will{' '}
                {confirmAction.action === 'ban_user'
                  ? 'suspend the user account'
                  : 'hide the content'}{' '}
                and mark the report as resolved. This can be undone from the Trash Bin.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  handleAction(confirmAction.reportId, 'RESOLVED', confirmAction.action)
                }
                disabled={actionLoading}
                className={
                  confirmAction.action === 'ban_user'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-orange-600 hover:bg-orange-700'
                }
              >
                {actionLoading ? 'Processing...' : confirmAction.label}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
