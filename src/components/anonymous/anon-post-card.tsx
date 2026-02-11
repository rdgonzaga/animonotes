import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CategoryBadge } from "@/components/categories/category-badge";
import { UserX } from "lucide-react";

interface AnonPost {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  createdAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  _count: {
    comments: number;
    votes: number;
  };
  score: number;
}

interface AnonPostCardProps {
  post: AnonPost;
}

export function AnonPostCard({ post }: AnonPostCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <Link href={`/anonymous/${post.id}`}>
              <h2 className="text-xl font-semibold hover:text-primary transition-colors">
                {post.title}
              </h2>
            </Link>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                  <UserX className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="font-medium text-orange-600">Anonymous</span>
              </div>
              <span>•</span>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <CategoryBadge name={post.category.name} slug={post.category.slug} />
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{post.score}</div>
            <div className="text-xs text-muted-foreground">votes</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>{post._count.comments} comments</span>
        </div>
      </CardContent>
    </Card>
  );
}
