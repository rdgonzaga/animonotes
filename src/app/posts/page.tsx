import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CategoryBadge } from "@/components/categories/category-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

async function getPosts() {
  const res = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/posts`, {
    cache: "no-store",
  });
  if (!res.ok) return { posts: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
  return res.json();
}

export default async function PostsPage() {
  const { posts, pagination } = await getPosts();

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Posts</h1>
        <Link href="/posts/new">
          <Button>Create Post</Button>
        </Link>
      </div>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No posts yet. Be the first to create one!
            </CardContent>
          </Card>
        ) : (
          posts.map((post: any) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Link href={`/posts/${post.id}`}>
                      <h2 className="text-xl font-semibold hover:text-primary transition-colors">
                        {post.title}
                      </h2>
                    </Link>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      {post.author ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={post.author.image || undefined} />
                            <AvatarFallback>
                              {post.author.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>{post.author.name}</span>
                        </div>
                      ) : (
                        <span>Anonymous</span>
                      )}
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
          ))
        )}
      </div>
    </div>
  );
}
