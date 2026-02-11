"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/categories/category-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search as SearchIcon } from "lucide-react";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<any>({ posts: [], users: [] });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) return;

    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error("Search error:", error);
    }

    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Search</h1>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Search posts and users..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={loading}>
            <SearchIcon className="h-4 w-4 mr-2" />
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
      </form>

      {searched && !loading && (
        <div className="space-y-8">
          {/* Posts Results */}
          {results.posts && results.posts.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">
                Posts ({results.posts.length})
              </h2>
              <div className="space-y-4">
                {results.posts.map((post: any) => (
                  <Card key={post.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <Link href={`/posts/${post.id}`}>
                            <h3 className="text-xl font-semibold hover:text-primary transition-colors">
                              {post.title}
                            </h3>
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
                            <CategoryBadge 
                              name={post.category.name} 
                              slug={post.category.slug} 
                            />
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{post.score}</div>
                          <div className="text-xs text-muted-foreground">votes</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        {post._count.comments} comments
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Users Results */}
          {results.users && results.users.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">
                Users ({results.users.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.users.map((user: any) => (
                  <Card key={user.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <Link href={`/profile/${user.id}`}>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={user.image || undefined} />
                            <AvatarFallback className="text-lg">
                              {user.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold hover:text-primary transition-colors">
                              {user.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {user._count.posts} posts • {user._count.comments} comments
                            </div>
                          </div>
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {results.posts?.length === 0 && results.users?.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No results found for "{query}"
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!searched && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Enter a search query to find posts and users
          </CardContent>
        </Card>
      )}
    </div>
  );
}
