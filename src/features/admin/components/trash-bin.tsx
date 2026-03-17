'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, RotateCcw, AlertTriangle, FileText, MessageSquare, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import type { TrashItem, TrashItemType } from '../types';

export function TrashBin() {
  const [items, setItems] = useState<TrashItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<TrashItemType | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [restoreItem, setRestoreItem] = useState<TrashItem | null>(null);
  const [hardDeleteItem, setHardDeleteItem] = useState<TrashItem | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (typeFilter !== 'all') params.set('type', typeFilter);
      const res = await fetch(`/api/admin/trash?${params}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
        setTotal(data.total);
      }
    } catch {
      setError('Failed to load trash');
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleRestore = async () => {
    if (!restoreItem) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/trash/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: restoreItem.id, type: restoreItem.type }),
      });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== restoreItem.id));
        setTotal((prev) => prev - 1);
        setRestoreItem(null);
        setSuccessMsg('Item restored successfully');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to restore');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const handleHardDelete = async () => {
    if (!hardDeleteItem || confirmText !== 'DELETE') return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/trash/hard-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [hardDeleteItem.id], type: hardDeleteItem.type }),
      });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== hardDeleteItem.id));
        setTotal((prev) => prev - 1);
        setHardDeleteItem(null);
        setConfirmText('');
        setSuccessMsg('Item permanently deleted');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    if (type === 'post') return <FileText className="h-4 w-4" />;
    if (type === 'comment') return <MessageSquare className="h-4 w-4" />;
    return <User className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-primary">Trash Bin</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Soft-deleted content. Items older than 30 days can be permanently deleted.
        </p>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
          {error}{' '}
          <button className="ml-2 underline" onClick={() => setError('')}>
            Dismiss
          </button>
        </div>
      )}
      {successMsg && (
        <div className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
          {successMsg}
        </div>
      )}

      <div className="flex gap-3">
        <Select
          value={typeFilter}
          onValueChange={(v) => {
            setTypeFilter(v as TrashItemType | 'all');
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="post">Posts</SelectItem>
            <SelectItem value="comment">Comments</SelectItem>
            <SelectItem value="user">Users</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="secondary" className="self-center">
          {total} items
        </Badge>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Trash2 className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-lg font-medium">Trash is empty</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Preview</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Deleted</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={`${item.type}-${item.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        {getTypeIcon(item.type)}
                        <span className="text-xs capitalize">{item.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[250px] truncate text-sm">{item.preview}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.authorName || '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(item.deletedAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.canHardDelete ? 'destructive' : 'secondary'}>
                        {item.ageInDays}d
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600"
                          onClick={() => setRestoreItem(item)}
                          title="Restore"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={() => {
                            setHardDeleteItem(item);
                            setConfirmText('');
                          }}
                          disabled={!item.canHardDelete}
                          title={item.canHardDelete ? 'Permanently delete' : 'Must be 30+ days old'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
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

      {/* Restore Confirm */}
      <AlertDialog open={!!restoreItem} onOpenChange={() => setRestoreItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Item</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the {restoreItem?.type} and make it visible again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore} disabled={actionLoading}>
              {actionLoading ? 'Restoring...' : 'Restore'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hard Delete Confirm */}
      <AlertDialog
        open={!!hardDeleteItem}
        onOpenChange={() => {
          setHardDeleteItem(null);
          setConfirmText('');
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" /> Permanently Delete
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action CANNOT be undone. The {hardDeleteItem?.type} will be permanently removed from
              the database. Type <strong>DELETE</strong> to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type DELETE to confirm"
            className="w-full border rounded-md px-3 py-2 text-sm mt-2"
          />
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleHardDelete}
              disabled={actionLoading || confirmText !== 'DELETE'}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? 'Deleting...' : 'Permanently Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
