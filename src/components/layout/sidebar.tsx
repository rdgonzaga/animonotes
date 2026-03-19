'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Home, User, Bookmark as BookmarkIcon, HelpCircle, Shield } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const [isMounted, setIsMounted] = useState(false);
  const role = (session?.user as Record<string, unknown> | undefined)?.role as string | undefined;
  const profileHref = session?.user?.id ? `/profile/${session.user.id}` : '/login';

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const links = [
    { href: '/', label: 'HOME', icon: Home, activePrefix: '/' },
    { href: profileHref, label: 'PROFILE', icon: User, activePrefix: '/profile' },
    { href: '/bookmarks', label: 'SAVED', icon: BookmarkIcon, activePrefix: '/bookmarks' },
    { href: '/faqs', label: 'FAQS', icon: HelpCircle, activePrefix: '/faqs' },
  ];

  return (
    <aside className="hidden lg:flex flex-col gap-1 w-44 xl:w-48 shrink-0 pt-2">
      {links.map((link) => {
        const isActive =
          link.activePrefix === '/' ? pathname === '/' : pathname.startsWith(link.activePrefix);
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
      {isMounted && (role === 'admin' || role === 'moderator') && (
        <Link
          href="/admin"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mt-2 border-t border-border pt-4 ${
            pathname.startsWith('/admin')
              ? 'text-primary font-medium bg-primary/5'
              : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
          }`}
        >
          <Shield className="h-4 w-4" /> ADMIN
        </Link>
      )}
    </aside>
  );
}
