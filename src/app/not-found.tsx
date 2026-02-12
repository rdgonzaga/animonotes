import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] py-8 px-4">
      <Card className="max-w-md w-full text-center">
        <CardContent className="pt-12 pb-10 space-y-6">
          <div>
            <h1 className="font-serif text-8xl font-bold text-primary">404</h1>
            <span className="accent-line mx-auto mt-4" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-serif font-bold">Page Not Found</p>
            <p className="text-muted-foreground">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
          </div>
          <Link href="/">
            <Button className="gap-2">
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
