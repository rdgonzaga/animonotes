'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, Bookmark as BookmarkIcon, HelpCircle } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'HOME', icon: Home },
    { href: '/settings/profile', label: 'PROFILE', icon: User },
    { href: '/bookmarks', label: 'SAVED', icon: BookmarkIcon },
    { href: '/faqs', label: 'FAQS', icon: HelpCircle },
  ];

  return (
    <aside className="hidden lg:flex flex-col gap-1 w-44 xl:w-48 shrink-0 pt-2">
      {links.map((link) => {
        const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              isActive
                ? 'text-primary font-medium bg-primary/5'
                : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
            }`}
          >
            <link.icon className="h-4 w-4" /> {link.label}
          </Link>
        );
      })}
    </aside>
  );
}
