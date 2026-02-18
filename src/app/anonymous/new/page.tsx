'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TiptapEditor } from '@/features/editor/components/tiptap-editor';
import { AnonDisclaimer } from '@/features/anonymous/components/anon-disclaimer';

export default function NewAnonymousPostPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, categoryId: data[0].id }));
        }
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/anonymous/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to create anonymous post');
        setLoading(false);
        return;
      }

      const post = await response.json();
      router.push(`/anonymous/${post.id}`);
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full py-8 px-4">
      <AnonDisclaimer />

      <Card>
        <CardHeader>
          <CardTitle>Ask Anonymously</CardTitle>
          <p className="text-sm text-muted-foreground">
            Your identity will never be stored. Only you can edit/delete this post (via browser
            cookies).
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Question Title</Label>
              <Input
                id="title"
                type="text"
                placeholder="What's your question?"
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
              <Label>Details</Label>
              <TiptapEditor
                content={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                placeholder="Provide more details about your question..."
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Posting...' : 'Post Anonymously'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
