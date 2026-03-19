import Link from 'next/link';

interface SiteFooterProps {
  compact?: boolean;
}

export function SiteFooter({ compact = false }: SiteFooterProps) {
  if (compact) {
    return (
      <div className="border-t border-border pt-4 mt-4 text-xs text-muted-foreground space-y-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Link href="/faqs" className="hover:text-primary transition-colors">
            FAQs
          </Link>
          <Link href="/about" className="hover:text-primary transition-colors">
            About
          </Link>
          <Link href="/faqs" className="hover:text-primary transition-colors">
            Help
          </Link>
        </div>
        <p>&copy; {new Date().getFullYear()} AnimoNotes</p>
      </div>
    );
  }

  return (
    <footer className="hidden md:block border-t border-border bg-background">
      <div className="max-w-7xl mx-auto w-full px-4 py-8">
        <div className="flex flex-col items-center gap-4">
          <span className="font-sans text-xl font-bold text-primary">AnimoNotes</span>
          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/faqs"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              FAQs
            </Link>
            <Link
              href="/about"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              About
            </Link>
            <Link
              href="/faqs"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Help
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} AnimoNotes. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
