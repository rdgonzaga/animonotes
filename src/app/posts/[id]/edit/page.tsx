'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TiptapEditor } from '@/features/editor/components/tiptap-editor';
import { authClient } from '@/lib/auth-client';

export default function EditPostPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isPending) {
      return;
    }

    if (!session?.user) {
      router.push('/login');
      return;
    }

    // Fetch post and categories
    Promise.all([
      fetch(`/api/posts/${postId}`).then((res) => res.json()),
      fetch('/api/categories').then((res) => res.json()),
    ]).then(([post, cats]) => {
      if (post.authorId !== session.user.id) {
        router.push(`/posts/${postId}`);
        return;
      }
      setFormData({
        title: post.title,
        content: post.content,
        categoryId: post.categoryId,
      });
      setCategories(cats);
      setLoading(false);
    });
  }, [isPending, session, postId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to update post');
        setSaving(false);
        return;
      }

      router.push(`/posts/${postId}`);
    } catch (err) {
      setError('An unexpected error occurred');
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="container py-8">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto w-full py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Edit Post</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                required
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Content</Label>
              <TiptapEditor
                content={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/posts/${postId}`)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
