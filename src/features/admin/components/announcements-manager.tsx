'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Plus, Edit2, Trash2, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import type { AdminAnnouncement, AnnouncementType } from '../types';

const TYPE_COLORS: Record<AnnouncementType, string> = {
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export function AnnouncementsManager() {
  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editAnnouncement, setEditAnnouncement] = useState<AdminAnnouncement | null>(null);
  const [deleteAnnouncement, setDeleteAnnouncement] = useState<AdminAnnouncement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info' as AnnouncementType,
    endsAt: '',
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/announcements');
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data.announcements);
        setTotal(data.total);
      }
    } catch {
      setError('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      setError('Title and content are required');
      return;
    }
    setActionLoading(true);
    try {
      const url = editAnnouncement
        ? `/api/admin/announcements/${editAnnouncement.id}`
        : '/api/admin/announcements';
      const method = editAnnouncement ? 'PATCH' : 'POST';
      const body: Record<string, unknown> = {
        title: formData.title,
        content: formData.content,
        type: formData.type,
      };
      if (formData.endsAt) body.endsAt = new Date(formData.endsAt).toISOString();
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        await fetchAnnouncements();
        setFormOpen(false);
        setEditAnnouncement(null);
        setFormData({ title: '', content: '', type: 'info', endsAt: '' });
        setSuccessMsg(editAnnouncement ? 'Announcement updated' : 'Announcement created');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (announcement: AdminAnnouncement) => {
    try {
      const res = await fetch(`/api/admin/announcements/${announcement.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !announcement.isActive }),
      });
      if (res.ok) {
        setAnnouncements((prev) =>
          prev.map((a) => (a.id === announcement.id ? { ...a, isActive: !a.isActive } : a)),
        );
      }
    } catch {
      setError('Failed to toggle announcement');
    }
  };

  const handleDelete = async () => {
    if (!deleteAnnouncement) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/announcements/${deleteAnnouncement.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setAnnouncements((prev) => prev.filter((a) => a.id !== deleteAnnouncement.id));
        setDeleteAnnouncement(null);
        setSuccessMsg('Announcement deleted');
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-primary">Announcements</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage site-wide banners and notifications</p>
        </div>
        <Button
          onClick={() => {
            setEditAnnouncement(null);
            setFormData({ title: '', content: '', type: 'info', endsAt: '' });
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" /> New Announcement
        </Button>
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

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Megaphone className="h-4 w-4" /> Banners ({total})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Megaphone className="h-10 w-10 mb-3 opacity-30" />
              <p>No announcements yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {announcements.map((ann) => (
                  <TableRow key={ann.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{ann.title}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {ann.content}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full capitalize ${TYPE_COLORS[ann.type as AnnouncementType]}`}
                      >
                        {ann.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={ann.isActive}
                        onCheckedChange={() => handleToggleActive(ann)}
                      />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(ann.createdAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditAnnouncement(ann);
                            setFormData({
                              title: ann.title,
                              content: ann.content,
                              type: ann.type as AnnouncementType,
                              endsAt: ann.endsAt ? ann.endsAt.substring(0, 16) : '',
                            });
                            setFormOpen(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={() => setDeleteAnnouncement(ann)}
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

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editAnnouncement ? 'Edit Announcement' : 'New Announcement'}</DialogTitle>
            <DialogDescription>Create a site-wide banner for all users</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="ann-title">Title</Label>
              <Input
                id="ann-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Scheduled Maintenance"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="ann-content">Content</Label>
              <Textarea
                id="ann-content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Announcement message..."
                rows={3}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="ann-type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => setFormData({ ...formData, type: v as AnnouncementType })}
              >
                <SelectTrigger id="ann-type" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info (blue)</SelectItem>
                  <SelectItem value="warning">Warning (yellow)</SelectItem>
                  <SelectItem value="urgent">Urgent (red)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ann-ends">Ends At (optional)</Label>
              <Input
                id="ann-ends"
                type="datetime-local"
                value={formData.endsAt}
                onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSubmit} disabled={actionLoading}>
                {actionLoading ? 'Saving...' : editAnnouncement ? 'Update' : 'Create'}
              </Button>
              <Button variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteAnnouncement} onOpenChange={() => setDeleteAnnouncement(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete announcement?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the announcement banner.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
