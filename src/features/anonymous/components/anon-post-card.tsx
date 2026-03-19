import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CategoryBadge } from '@/features/categories/components/category-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { AnonPostCardProps } from '../types/anon-post';

const ANON_PROFILE_IMAGE = '/dummy_icons/profile_anon.webp';

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
                <Avatar className="h-6 w-6">
                  <AvatarImage src={ANON_PROFILE_IMAGE} />
                  <AvatarFallback>A</AvatarFallback>
                </Avatar>
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
