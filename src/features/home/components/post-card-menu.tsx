'use client';

import { useState } from 'react';
import { MoreHorizontal, Share2, Flag, Copy, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import type { PostCardMenuProps } from '../types/post-card-menu';
import { authClient } from '@/lib/auth-client';

export function PostCardMenu({ postId, postTitle }: PostCardMenuProps) {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const [shareOpen, setShareOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reportError, setReportError] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  const postUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/posts/${postId}`
      : `/posts/${postId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleReport = async () => {
    if (!session) {
      router.push('/login');
      return;
    }
    if (reason.trim().length < 10) {
      setReportError('Reason must be at least 10 characters');
      return;
    }
    setSubmitting(true);
    setReportError('');
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, reason }),
      });
      if (!res.ok) {
        const data = await res.json();
        setReportError(data.error || 'Failed to submit report');
        setSubmitting(false);
        return;
      }
      setReportSuccess(true);
      setTimeout(() => {
        setReportOpen(false);
        setReason('');
        setReportSuccess(false);
      }, 2000);
    } catch {
      setReportError('An unexpected error occurred');
    }
    setSubmitting(false);
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(postTitle)}&url=${encodeURIComponent(postUrl)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="text-muted-foreground hover:text-primary transition-colors">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShareOpen(true)}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setReportOpen(true)}>
            <Flag className="h-4 w-4 mr-2" />
            Report
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Share Dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share this post</DialogTitle>
            <DialogDescription>
              Share this post with others via social media or copy the link
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input value={postUrl} readOnly />
              <Button onClick={handleCopy} variant="outline">
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" /> Copy
                  </>
                )}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={shareToTwitter} variant="outline" size="sm">
                Twitter / X
              </Button>
              <Button onClick={shareToFacebook} variant="outline" size="sm">
                Facebook
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report post</DialogTitle>
            <DialogDescription>
              Help us maintain a safe community by reporting inappropriate content.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Please describe why you're reporting this (minimum 10 characters)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={5}
            />
            {reportError && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                {reportError}
              </div>
            )}
            {reportSuccess && (
              <div className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                Report submitted successfully. Thank you!
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={handleReport} disabled={submitting || reportSuccess}>
                {submitting ? 'Submitting...' : reportSuccess ? 'Submitted' : 'Submit Report'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setReportOpen(false);
                  setReason('');
                  setReportError('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
