import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Navbar } from '@/components/layout/navbar';
import { BottomTabs } from '@/components/layout/bottom-tabs';
import { AnnouncementBanner } from '@/features/admin/components/announcement-banner';
import { ConditionalFooter } from '@/components/layout/conditional-footer';

export const metadata: Metadata = {
  title: 'AnimoNotes',
  description: 'A modern forum for thoughtful discussion',
  icons: {
    icon: '/dummy_icons/animonotes_logo.webp',
    shortcut: '/dummy_icons/animonotes_logo.webp',
    apple: '/dummy_icons/animonotes_logo.webp',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Outfit:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            {/* Don't show announcement banner on admin pages */}
            <AnnouncementBanner />
            <main className="flex-1 pb-16 md:pb-0">{children}</main>
            <ConditionalFooter />
            <BottomTabs />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
