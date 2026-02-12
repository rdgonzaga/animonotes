'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Ban, ShieldOff } from 'lucide-react';

interface BlockUserButtonProps {
  userId: string;
  userName: string;
  isBlocked?: boolean;
  onBlockChange?: () => void;
}

export function BlockUserButton({
  userId,
  userName,
  isBlocked = false,
  onBlockChange,
}: BlockUserButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBlock = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${userId}/block`, {
        method: isBlocked ? 'DELETE' : 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update block status');
      }

      setOpen(false);
      onBlockChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={isBlocked ? 'outline' : 'destructive'} size="sm">
          {isBlocked ? (
            <>
              <ShieldOff className="h-4 w-4 mr-2" />
              Unblock
            </>
          ) : (
            <>
              <Ban className="h-4 w-4 mr-2" />
              Block User
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isBlocked ? 'Unblock User' : 'Block User'}</DialogTitle>
          <DialogDescription>
            {isBlocked ? (
              <>
                Are you sure you want to unblock <strong>{userName}</strong>? They will be able to
                send you messages again.
              </>
            ) : (
              <>
                Are you sure you want to block <strong>{userName}</strong>? You won't be able to
                send or receive messages from this user.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded">
            {error}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant={isBlocked ? 'default' : 'destructive'}
            onClick={handleBlock}
            disabled={loading}
          >
            {loading ? 'Processing...' : isBlocked ? 'Unblock' : 'Block'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
