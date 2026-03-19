'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CategoryBadge } from '@/features/categories/components/category-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search as SearchIcon, Calendar, Eye, MessageSquare } from 'lucide-react';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

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
      console.error('Search error:', error);
    }
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  return (
    <div className="max-w-4xl mx-auto w-full py-8 px-4">
      <div className="mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-2">Search</h1>
        <span className="accent-line" />
      </div>

      <form onSubmit={handleSubmit} className="mb-10">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Type Something here...."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-12 text-base rounded-full"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="rounded-full px-6 w-full sm:w-auto"
          >
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </form>

      {searched && !loading && (
        <div className="space-y-10">
          {results.posts && results.posts.length > 0 && (
            <div>
              <h2 className="font-serif text-2xl font-bold mb-4">Posts ({results.posts.length})</h2>
              <div className="space-y-4">
                {results.posts.map((post: any) => (
                  <Card key={post.id} className="group hover:shadow-md transition-all duration-200">
                    <CardContent className="p-5">
                      <div className="flex gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            {post.author ? (
                              <>
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={post.author.image || undefined} />
                                  <AvatarFallback className="text-xs bg-muted">
                                    {post.author.name?.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-semibold">{post.author.name}</span>
                              </>
                            ) : (
                              <span className="text-sm font-semibold">Anonymous</span>
                            )}
                          </div>
                          <Link href={`/posts/${post.id}`}>
                            <h3 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1 mb-1">
                              {post.title}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3.5 w-3.5" />
                              {post.score}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3.5 w-3.5" />
                              {post._count.comments}
                            </span>
                            {post.category && (
                              <span className="badge-category ml-auto">{post.category.name}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {results.users && results.users.length > 0 && (
            <div>
              <h2 className="font-serif text-2xl font-bold mb-4">Users ({results.users.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.users.map((user: any) => (
                  <Card key={user.id} className="group hover:shadow-md transition-all duration-200">
                    <CardContent className="pt-6">
                      <Link href={`/profile/${user.username || user.id}`}>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={user.image || undefined} />
                            <AvatarFallback className="text-lg bg-primary/10 text-primary">
                              {user.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold group-hover:text-primary transition-colors">
                              {user.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {user._count.posts} posts · {user._count.comments} comments
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

          {results.posts?.length === 0 && results.users?.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <SearchIcon className="h-12 w-12 text-primary/40 mx-auto mb-4" />
                <p className="text-lg font-serif font-bold mb-1">No results found</p>
                <p className="text-muted-foreground">Try a different search term</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!searched && (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <SearchIcon className="h-12 w-12 text-primary/40 mx-auto mb-4" />
            <p className="text-lg font-serif font-bold mb-1">Find what you&apos;re looking for</p>
            <p className="text-muted-foreground">Enter a search query to find posts and users</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
