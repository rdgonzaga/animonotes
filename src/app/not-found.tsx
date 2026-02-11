import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-center">404</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-xl font-semibold">Page Not Found</p>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link href="/">
            <Button className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
