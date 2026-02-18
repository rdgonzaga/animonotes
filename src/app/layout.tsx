import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Navbar } from '@/components/layout/navbar';
import { BottomTabs } from '@/components/layout/bottom-tabs';

export const metadata: Metadata = {
  title: 'Animo Notes',
  description: 'A modern forum for thoughtful discussion',
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
            <main className="flex-1 pb-16 md:pb-0">{children}</main>
            <footer className="hidden md:block border-t border-border bg-background">
              <div className="max-w-7xl mx-auto w-full px-4 py-8">
                <div className="flex flex-col items-center gap-4">
                  <span className="font-serif text-xl font-bold text-primary">Animo Notes</span>
                  <div className="flex items-center gap-6 text-sm">
                    <a
                      href="/faqs"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      FAQs
                    </a>
                    <a
                      href="/about"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      About
                    </a>
                    <a
                      href="/faqs"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      Help
                    </a>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    &copy; {new Date().getFullYear()} Animo Notes. All rights reserved.
                  </p>
                </div>
              </div>
            </footer>
            <BottomTabs />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
