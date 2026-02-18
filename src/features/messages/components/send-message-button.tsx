'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import type { SendMessageButtonProps } from '../types/send-message-button';
import { authClient } from '@/lib/auth-client';

export function SendMessageButton({ recipientId, recipientName }: SendMessageButtonProps) {
  const { data: session } = authClient.useSession();
  const [loading, setLoading] = useState(false);

  // Don't show if not logged in or viewing own profile
  if (!session?.user || session.user.id === recipientId) {
    return null;
  }

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to start conversation');
        setLoading(false);
        return;
      }

      const conversation = await res.json();
      window.location.href = `/messages/${conversation.id}`;
    } catch {
      alert('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleClick} disabled={loading} variant="outline" className="gap-2">
      <MessageSquare className="h-4 w-4" />
      {loading ? 'Opening...' : `Message ${recipientName}`}
    </Button>
  );
}
