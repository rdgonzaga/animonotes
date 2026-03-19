'use client';

import { useState, useEffect } from 'react';
import { X, Info, AlertTriangle, AlertOctagon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'urgent';
}

const DISMISSED_KEY = 'dismissed-announcements';

const TYPE_STYLES = {
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    text: 'text-blue-800 dark:text-blue-200',
    icon: Info,
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    text: 'text-yellow-800 dark:text-yellow-200',
    icon: AlertTriangle,
  },
  urgent: {
    bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    text: 'text-red-800 dark:text-red-200',
    icon: AlertOctagon,
  },
};

export function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch('/api/admin/announcements/active');
        if (!res.ok) return;
        const announcements: Announcement[] = await res.json();
        if (!announcements.length) return;

        // Get dismissed IDs from localStorage
        const dismissedIds: string[] = JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]');

        // Find highest priority non-dismissed announcement
        const priority = ['urgent', 'warning', 'info'];
        for (const type of priority) {
          const found = announcements.find((a) => a.type === type && !dismissedIds.includes(a.id));
          if (found) {
            setAnnouncement(found);
            return;
          }
        }
      } catch {
        // Silently fail — announcements are non-critical
      }
    };

    fetchAnnouncements();
  }, []);

  const handleDismiss = () => {
    if (!announcement) return;
    const dismissedIds: string[] = JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]');
    dismissedIds.push(announcement.id);
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissedIds));
    setDismissed(true);
  };

  if (!announcement || dismissed) return null;

  const styles = TYPE_STYLES[announcement.type];
  const Icon = styles.icon;

  return (
    <div className={cn('border-b px-4 py-2.5', styles.bg)}>
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <Icon className={cn('h-4 w-4 shrink-0', styles.text)} />
        <div className="flex-1 min-w-0">
          <span className={cn('font-medium text-sm', styles.text)}>{announcement.title}: </span>
          <span className={cn('text-sm', styles.text)}>{announcement.content}</span>
        </div>
        <button
          onClick={handleDismiss}
          className={cn('shrink-0 hover:opacity-70 transition-opacity', styles.text)}
          aria-label="Dismiss announcement"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
