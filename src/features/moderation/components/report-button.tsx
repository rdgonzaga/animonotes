'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Flag } from 'lucide-react';
import type { ReportButtonProps } from '../types/report-button';
import { authClient } from '@/lib/auth-client';

export function ReportButton({ targetId, targetType }: ReportButtonProps) {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!session) {
      router.push('/login');
      return;
    }

    if (reason.trim().length < 10) {
      setError('Reason must be at least 10 characters');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const body: any = { reason };
      if (targetType === 'post') body.postId = targetId;
      else if (targetType === 'comment') body.commentId = targetId;
      else if (targetType === 'user') body.userId = targetId;

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to submit report');
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setReason('');
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError('An unexpected error occurred');
    }

    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Flag className="h-4 w-4 mr-2" />
          Report
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report {targetType}</DialogTitle>
          <DialogDescription>
            Help us maintain a safe community by reporting inappropriate content or behavior.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="Please describe why you're reporting this (minimum 10 characters)..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={5}
          />

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
              Report submitted successfully. Thank you for helping keep our community safe.
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={submitting || success}>
              {submitting ? 'Submitting...' : success ? 'Submitted' : 'Submit Report'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                setReason('');
                setError('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
