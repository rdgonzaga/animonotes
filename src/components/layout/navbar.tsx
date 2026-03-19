'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Search, Bell, PenSquare, Home, User, Shield, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/theme-toggle';
import { LogoutButton } from '@/features/auth/components/logout-button';
import { authClient } from '@/lib/auth-client';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-50 w-full gradient-green shadow-md">
      <div className="max-w-7xl mx-auto w-full flex h-16 items-center justify-between px-4 gap-4">
        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-white hover:bg-white/10"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="font-sans text-2xl font-bold text-white">AnimoNotes</span>
        </Link>

        {/* Desktop Search Bar */}
        <form
          className="hidden md:flex flex-1 max-w-md mx-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (searchQuery.trim().length >= 2) {
              router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            } else {
              router.push('/search');
            }
          }}
        >
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
            <input
              type="text"
              placeholder="Type Something here...."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-full bg-white/20 border border-white/30 text-white placeholder:text-white/60 text-sm focus:outline-none focus:bg-white/30 focus:border-white/50 transition-colors"
            />
          </div>
        </form>

        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/anonymous"
            className="text-white/80 hover:text-white text-sm transition-colors"
          >
            Q&A
          </Link>
          <Link href="/posts/new">
            <Button
              size="sm"
              className="bg-white text-primary hover:bg-white/90 gap-1.5 rounded-lg font-medium"
            >
              <PenSquare className="h-4 w-4" />
              Write
            </Button>
          </Link>
          <Link href="/messages">
            <Button
              variant="ghost"
              size="icon"
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <Bell className="h-5 w-5" />
            </Button>
          </Link>
          <ThemeToggle />

          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full p-0 hover:bg-white/10"
                >
                  <Avatar className="h-9 w-9 ring-2 ring-white/50">
                    <AvatarImage src={session.user.image || undefined} />
                    <AvatarFallback className="bg-white/20 text-white text-sm font-medium">
                      {session.user.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user.image || undefined} />
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {session.user.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium leading-tight">{session.user.name}</p>
                    <p className="text-xs text-muted-foreground leading-tight">
                      {session.user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <Link href={`/profile/${session.user.id}`}>
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                </Link>
                <Link href="/bookmarks">
                  <DropdownMenuItem>Bookmarks</DropdownMenuItem>
                </Link>
                <Link href="/messages">
                  <DropdownMenuItem>Messages</DropdownMenuItem>
                </Link>
                <Link href="/settings/profile">
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <LogoutButton />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button size="sm" className="bg-white text-primary hover:bg-white/90 rounded-lg">
                  Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Right Side */}
        <div className="flex md:hidden items-center gap-2">
          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full p-0 hover:bg-white/10"
                >
                  <Avatar className="h-9 w-9 ring-2 ring-white/50">
                    <AvatarImage src={session.user.image || undefined} />
                    <AvatarFallback className="bg-white/20 text-white text-sm font-medium">
                      {session.user.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user.image || undefined} />
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {session.user.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium leading-tight">{session.user.name}</p>
                    <p className="text-xs text-muted-foreground leading-tight">
                      {session.user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <Link href={`/profile/${session.user.id}`}>
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                </Link>
                <Link href="/bookmarks">
                  <DropdownMenuItem>Bookmarks</DropdownMenuItem>
                </Link>
                <Link href="/messages">
                  <DropdownMenuItem>Messages</DropdownMenuItem>
                </Link>
                <Link href="/settings/profile">
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <LogoutButton />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Avatar className="h-9 w-9 ring-2 ring-white/50 cursor-pointer">
                <AvatarFallback className="bg-white/20 text-white">
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile slide-down menu */}
      {mobileOpen && (
        <div className="md:hidden bg-card/95 dark:bg-card/95 backdrop-blur-md border-t border-border px-4 py-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
          <Link href="/" onClick={() => setMobileOpen(false)}>
            <Button
              variant={pathname === '/' ? 'secondary' : 'ghost'}
              className="w-full justify-start gap-2"
            >
              <Home className="h-4 w-4" /> Home
            </Button>
          </Link>
          <Link href="/posts" onClick={() => setMobileOpen(false)}>
            <Button
              variant={pathname.startsWith('/posts') ? 'secondary' : 'ghost'}
              className="w-full justify-start gap-2"
            >
              <BookOpen className="h-4 w-4" /> Posts
            </Button>
          </Link>
          <Link href="/anonymous" onClick={() => setMobileOpen(false)}>
            <Button
              variant={pathname.startsWith('/anonymous') ? 'secondary' : 'ghost'}
              className="w-full justify-start gap-2"
            >
              <Shield className="h-4 w-4" /> Anonymous Q&A
            </Button>
          </Link>
          <Link href="/search" onClick={() => setMobileOpen(false)}>
            <Button
              variant={pathname === '/search' ? 'secondary' : 'ghost'}
              className="w-full justify-start gap-2"
            >
              <Search className="h-4 w-4" /> Search
            </Button>
          </Link>
          {!session?.user && (
            <div className="flex gap-2 pt-3 border-t border-border mt-3">
              <Link href="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                <Button className="w-full bg-white text-primary hover:bg-white/90">Sign In</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
