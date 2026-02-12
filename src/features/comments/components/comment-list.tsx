'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CommentThread } from './comment-thread';
import { useSSE } from '@/hooks/useSSE';
import type { CommentBase, CommentListProps, CommentWithChildren } from '../types/comment';

export function CommentList({ postId }: CommentListProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [comments, setComments] = useState<CommentWithChildren[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  // Subscribe to real-time comment updates via SSE
  useSSE(
    'comment-new',
    (data) => {
      // Only update if this is for our post
      const commentData = data as { postId: string; comment: CommentBase };
      if (commentData.postId === postId) {
        // Add new comment to the list
        setComments((prev) => [...prev, commentData.comment]);
      }
    },
    {
      channels: [`post-${postId}`],
    }
  );

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/posts/${postId}/comments`);
      const data = await res.json();
      setComments(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!session) {
      router.push('/login');
      return;
    }

    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      });

      if (res.ok) {
        setNewComment('');
        await fetchComments();
      }
    } catch (error) {
      console.error('Failed to post comment:', error);
    }
    setSubmitting(false);
  };

  const handleReply = async (parentId: string, content: string) => {
    if (!session) {
      router.push('/login');
      return;
    }

    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, parentId }),
    });

    if (res.ok) {
      await fetchComments();
    }
  };

  // Build comment tree
  const buildTree = (comments: CommentWithChildren[]) => {
    const map = new Map<string, CommentWithChildren & { children: CommentWithChildren[] }>();
    const roots: (CommentWithChildren & { children: CommentWithChildren[] })[] = [];

    // Initialize map
    comments.forEach((comment) => {
      map.set(comment.id, { ...comment, children: [] });
    });

    // Build tree
    comments.forEach((comment) => {
      const node = map.get(comment.id)!;
      if (comment.parentId) {
        const parent = map.get(comment.parentId);
        if (parent) {
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const renderCommentTree = (comment: CommentWithChildren, depth = 0) => {
    return (
      <div key={comment.id}>
        <CommentThread comment={comment} postId={postId} depth={depth} onReply={handleReply} />
        {comment.children?.map((child) => renderCommentTree(child, depth + 1))}
      </div>
    );
  };

  if (loading) {
    return <div>Loading comments...</div>;
  }

  const commentTree = buildTree(comments);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Textarea
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={4}
        />
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Posting...' : 'Post Comment'}
        </Button>
      </div>

      <div className="space-y-2">
        {commentTree.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          commentTree.map((comment) => renderCommentTree(comment))
        )}
      </div>
    </div>
  );
}
