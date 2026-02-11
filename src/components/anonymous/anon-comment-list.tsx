"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AnonCommentCard } from "./anon-comment-card";

interface AnonComment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    image: string | null;
  } | null;
  isAnonymous: boolean;
  score: number;
  parentId: string | null;
  _count: {
    replies: number;
  };
  children?: AnonComment[];
}

interface AnonCommentListProps {
  postId: string;
}

export function AnonCommentList({ postId }: AnonCommentListProps) {
  const [comments, setComments] = useState<AnonComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/anonymous/posts/${postId}/comments`);
      const data = await res.json();
      setComments(data.comments || []);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/anonymous/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });

      if (res.ok) {
        setNewComment("");
        await fetchComments();
      }
    } catch (error) {
      console.error("Failed to post comment:", error);
    }
    setSubmitting(false);
  };

  const handleReply = async (parentId: string, content: string) => {
    const res = await fetch(`/api/anonymous/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, parentId }),
    });

    if (res.ok) {
      await fetchComments();
    }
  };

  // Build comment tree
  const buildTree = (comments: AnonComment[]) => {
    const map = new Map<string, AnonComment & { children: AnonComment[] }>();
    const roots: (AnonComment & { children: AnonComment[] })[] = [];

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

  const renderCommentTree = (
    comment: AnonComment,
    depth = 0
  ) => {
    return (
      <div key={comment.id}>
        <AnonCommentCard
          comment={comment}
          postId={postId}
          depth={depth}
          onReply={handleReply}
        />
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
          placeholder="Write an anonymous comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={4}
        />
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Posting..." : "Post Anonymous Comment"}
        </Button>
      </div>

      <div className="space-y-2">
        {commentTree.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No comments yet. Be the first to comment anonymously!
          </p>
        ) : (
          commentTree.map((comment) => renderCommentTree(comment))
        )}
      </div>
    </div>
  );
}
