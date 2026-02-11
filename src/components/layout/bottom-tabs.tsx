'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PenSquare, Bookmark, Bell } from 'lucide-react';

const tabs = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/posts/new', label: 'Post', icon: PenSquare },
  { href: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
  { href: '/messages', label: 'Inbox', icon: Bell },
];

export function BottomTabs() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden items-center justify-around bg-card border-t border-border py-2 px-1">
      {tabs.map((tab) => {
        const isActive = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
              isActive ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <tab.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
