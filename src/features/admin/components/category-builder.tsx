'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, GitMerge, FolderTree } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import type { AdminCategory } from '../types';

export function CategoryBuilder() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<AdminCategory | null>(null);
  const [mergeSource, setMergeSource] = useState<AdminCategory | null>(null);
  const [mergeTarget, setMergeTarget] = useState('');
  const [deleteCategory, setDeleteCategory] = useState<AdminCategory | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/categories');
      if (res.ok) setCategories(await res.json());
    } catch {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

  const handleSubmit = async () => {
    if (!formData.name || !formData.slug) {
      setError('Name and slug are required');
      return;
    }
    setActionLoading(true);
    try {
      const url = editCategory ? `/api/admin/categories/${editCategory.id}` : '/api/admin/categories';
      const method = editCategory ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        await fetchCategories();
        setFormOpen(false);
        setEditCategory(null);
        setFormData({ name: '', slug: '', description: '' });
        setSuccessMsg(editCategory ? 'Category updated' : 'Category created');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save category');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (category: AdminCategory) => {
    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !category.isActive }),
      });
      if (res.ok) {
        setCategories((prev) =>
          prev.map((c) => (c.id === category.id ? { ...c, isActive: !c.isActive } : c)),
        );
      }
    } catch {
      setError('Failed to toggle category');
    }
  };

  const handleDelete = async () => {
    if (!deleteCategory) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/categories/${deleteCategory.id}`, { method: 'DELETE' });
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== deleteCategory.id));
        setDeleteCategory(null);
        setSuccessMsg('Category deleted');
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

  const handleMerge = async () => {
    if (!mergeSource || !mergeTarget) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/categories/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId: mergeSource.id, targetId: mergeTarget }),
      });
      if (res.ok) {
        await fetchCategories();
        setMergeSource(null);
        setMergeTarget('');
        setSuccessMsg('Categories merged successfully');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to merge');
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
          <h1 className="text-2xl font-sans font-bold text-primary">Category Builder</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage course categories and subjects</p>
        </div>
        <Button
          onClick={() => {
            setEditCategory(null);
            setFormData({ name: '', slug: '', description: '' });
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" /> New Category
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
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <FolderTree className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-lg font-medium">No categories yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Posts</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{cat.name}</p>
                        {cat.description && (
                          <p className="text-xs text-muted-foreground">{cat.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono">{cat.slug}</TableCell>
                    <TableCell className="text-sm">{cat.postCount}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={cat.isActive}
                          onCheckedChange={() => handleToggleActive(cat)}
                          aria-label={`Toggle ${cat.name} active status`}
                        />
                        <span className="text-xs text-muted-foreground">
                          {cat.isActive ? 'Active' : 'Archived'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditCategory(cat);
                            setFormData({
                              name: cat.name,
                              slug: cat.slug,
                              description: cat.description || '',
                            });
                            setFormOpen(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setMergeSource(cat);
                            setMergeTarget('');
                          }}
                          title="Merge into another category"
                        >
                          <GitMerge className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={() => setDeleteCategory(cat)}
                          disabled={cat.postCount > 0}
                          title={cat.postCount > 0 ? 'Cannot delete: has posts' : 'Delete'}
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
            <DialogTitle>{editCategory ? 'Edit Category' : 'New Category'}</DialogTitle>
            <DialogDescription>
              {editCategory ? 'Update category details' : 'Create a new course category'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cat-name">Name</Label>
              <Input
                id="cat-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                    slug: editCategory ? formData.slug : generateSlug(e.target.value),
                  })
                }
                placeholder="e.g. Computer Science"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="cat-slug">Slug</Label>
              <Input
                id="cat-slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g. computer-science"
                className="mt-1 font-mono"
              />
            </div>
            <div>
              <Label htmlFor="cat-desc">Description (optional)</Label>
              <Input
                id="cat-desc"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description"
                className="mt-1"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSubmit} disabled={actionLoading}>
                {actionLoading ? 'Saving...' : editCategory ? 'Update' : 'Create'}
              </Button>
              <Button variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Merge Dialog */}
      <AlertDialog open={!!mergeSource} onOpenChange={() => setMergeSource(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Merge &quot;{mergeSource?.name}&quot;</AlertDialogTitle>
            <AlertDialogDescription>
              All {mergeSource?.postCount} posts will be moved to the target category. The source
              category will be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Label>Merge into:</Label>
            <Select value={mergeTarget} onValueChange={setMergeTarget}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select target category" />
              </SelectTrigger>
              <SelectContent>
                {categories
                  .filter((c) => c.id !== mergeSource?.id)
                  .map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.postCount} posts)
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleMerge}
              disabled={actionLoading || !mergeTarget}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {actionLoading ? 'Merging...' : 'Merge Categories'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteCategory} onOpenChange={() => setDeleteCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &quot;{deleteCategory?.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the category. This cannot be undone.
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
