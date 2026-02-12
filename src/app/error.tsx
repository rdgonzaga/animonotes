'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] py-8 px-4">
      <Card className="max-w-md w-full text-center">
        <CardContent className="pt-12 pb-10 space-y-6">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
          <div className="space-y-2">
            <h1 className="font-serif text-2xl font-bold">Something went wrong</h1>
            <p className="text-muted-foreground">
              An error occurred while processing your request.
            </p>
          </div>
          {error.message && (
            <div className="bg-destructive/10 p-3 rounded-lg text-sm text-destructive text-left">
              {error.message}
            </div>
          )}
          <Button onClick={reset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
