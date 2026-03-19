'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Shield,
  Users,
  FolderTree,
  Trash2,
  ScrollText,
  Megaphone,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AdminSidebarProps } from '../types';
import { Separator } from '@/components/ui/separator';

export function AdminSidebar({ userRole }: AdminSidebarProps) {
  const pathname = usePathname();

  const contentLinks = [
    { href: '/admin', label: 'OVERVIEW', icon: LayoutDashboard, exact: true },
    { href: '/admin/reports', label: 'REPORTS', icon: Shield },
    { href: '/admin/trash', label: 'TRASH BIN', icon: Trash2 },
    { href: '/admin/audit', label: 'AUDIT LOG', icon: ScrollText },
  ];

  const adminOnlyLinks = [
    { href: '/admin/users', label: 'USERS', icon: Users },
    { href: '/admin/categories', label: 'CATEGORIES', icon: FolderTree },
    { href: '/admin/announcements', label: 'ANNOUNCEMENTS', icon: Megaphone },
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const linkClass = (active: boolean) =>
    cn(
      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm',
      active
        ? 'text-primary font-medium bg-primary/5'
        : 'text-muted-foreground hover:text-primary hover:bg-primary/5',
    );

  return (
    <aside className="hidden lg:flex flex-col gap-1 w-52 shrink-0 pt-2">
      <div className="mb-2">
        <Link href="/" className={cn(linkClass(false), 'text-xs')}>
          <ArrowLeft className="h-3 w-3" />
          BACK TO APP
        </Link>
      </div>

      <Separator className="mb-2" />

      <p className="text-xs font-semibold text-muted-foreground px-3 mb-1 uppercase tracking-wider">
        Moderation
      </p>
      {contentLinks.map((link) => (
        <Link key={link.href} href={link.href} className={linkClass(isActive(link.href, link.exact))}>
          <link.icon className="h-4 w-4 shrink-0" />
          {link.label}
        </Link>
      ))}

      {userRole === 'admin' && (
        <>
          <Separator className="my-2" />
          <p className="text-xs font-semibold text-muted-foreground px-3 mb-1 uppercase tracking-wider">
            Management
          </p>
          {adminOnlyLinks.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass(isActive(link.href))}>
              <link.icon className="h-4 w-4 shrink-0" />
              {link.label}
            </Link>
          ))}
        </>
      )}
    </aside>
  );
}
