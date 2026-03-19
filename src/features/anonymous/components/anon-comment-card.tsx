'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { VoteButtons } from '@/features/votes/components/vote-buttons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { AnonCommentCardProps } from '../types/anon-comment';

const ANON_PROFILE_IMAGE = '/dummy_icons/profile_anon.webp';

export function AnonCommentCard({
  comment,
  postId,
  depth = 0,
  onReply,
  userVote,
}: AnonCommentCardProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleReply = async () => {
    if (!replyContent.trim()) return;

    setSubmitting(true);
    try {
      await onReply(comment.id, replyContent);
      setReplyContent('');
      setShowReplyForm(false);
    } catch (error) {
      console.error('Reply error:', error);
    }
    setSubmitting(false);
  };

  const maxDepth = depth >= 5;

  return (
    <div className={`flex gap-2 ${depth > 0 ? 'ml-4 sm:ml-8 mt-4' : 'mt-4'}`}>
      <VoteButtons
        targetId={comment.id}
        targetType="comment"
        initialScore={comment.score}
        initialUserVote={userVote}
      />
      <div className="flex-1">
        <div className="flex items-center gap-2 text-sm">
          <Avatar className="h-6 w-6">
            <AvatarImage src={ANON_PROFILE_IMAGE} />
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <span className="font-medium text-orange-600">
            {comment.isAnonymous || !comment.author ? 'Anonymous' : comment.author.name}
          </span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className="mt-2 text-sm">{comment.content}</div>
        <div className="mt-2 flex gap-2">
          {!maxDepth && (
            <Button variant="ghost" size="sm" onClick={() => setShowReplyForm(!showReplyForm)}>
              Reply
            </Button>
          )}
          {comment._count.replies > 0 && (
            <span className="text-sm text-muted-foreground">
              {comment._count.replies} {comment._count.replies === 1 ? 'reply' : 'replies'}
            </span>
          )}
        </div>

        {showReplyForm && (
          <div className="mt-4 space-y-2">
            <Textarea
              placeholder="Write an anonymous reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <Button onClick={handleReply} disabled={submitting} size="sm">
                {submitting ? 'Posting...' : 'Post Anonymous Reply'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyContent('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
