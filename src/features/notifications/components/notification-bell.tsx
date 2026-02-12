'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useSSE } from '@/hooks/useSSE';
import { formatDistanceToNow } from 'date-fns';
import type { Notification, NotificationData } from '../types/notification-bell';

export function NotificationBell() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch notifications on mount
  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
    }
  }, [session]);

  // Subscribe to real-time notifications via SSE
  useSSE(
    'notification',
    (data) => {
      // Add new notification to the list
      const notification = data as Notification;
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    },
    {
      channels: [], // User-specific, no channel needed (filtered by userId in SSE)
    }
  );

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications?limit=10');
      const data = await res.json();
      setNotifications(data);
      setUnreadCount(data.filter((n: Notification) => !n.read).length);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
      });

      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const getNotificationMessage = (notification: Notification) => {
    switch (notification.type) {
      case 'comment_reply':
        return `${notification.data.authorName} replied to your comment`;
      case 'vote':
        return `${notification.data.voterName} voted on your ${notification.data.targetType}`;
      case 'mention':
        return `${notification.data.authorName} mentioned you`;
      case 'poll_end':
        return 'A poll you participated in has ended';
      case 'dm':
        return `${notification.data.senderName} sent you a message`;
      case 'report_resolved':
        return 'Your report has been resolved';
      default:
        return 'New notification';
    }
  };

  if (!session) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-sm text-muted-foreground">{unreadCount} unread</span>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">No notifications yet</div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`w-full p-4 text-left hover:bg-muted transition-colors ${
                    !notification.read ? 'bg-blue-50 dark:bg-blue-950' : ''
                  }`}
                >
                  <p className="text-sm font-medium">{getNotificationMessage(notification)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
