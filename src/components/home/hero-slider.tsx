'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface FeaturedPost {
  id: string;
  title: string;
  content: string;
  image?: string | null;
  author?: { id: string; name: string | null; image: string | null } | null;
  category?: { id: string; name: string; slug: string } | null;
}

interface HeroSliderProps {
  featuredPosts: FeaturedPost[];
}

export function HeroSlider({ featuredPosts }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goNext = useCallback(() => {
    if (featuredPosts.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % featuredPosts.length);
  }, [featuredPosts.length]);

  const goPrev = useCallback(() => {
    if (featuredPosts.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + featuredPosts.length) % featuredPosts.length);
  }, [featuredPosts.length]);

  useEffect(() => {
    if (featuredPosts.length <= 1) return;
    const interval = setInterval(goNext, 5000);
    return () => clearInterval(interval);
  }, [goNext, featuredPosts.length]);

  if (featuredPosts.length === 0) {
    return (
      <section className="relative w-full h-64 md:h-80 gradient-hero overflow-hidden">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative max-w-7xl mx-auto w-full h-full flex items-end px-4 pb-6">
          <div className="text-white">
            <h2 className="font-serif text-2xl md:text-4xl font-bold">Welcome to AnimoNotes</h2>
            <p className="text-sm opacity-80 mt-2">A space for thoughtful discussion and sharing</p>
          </div>
        </div>
      </section>
    );
  }

  const post = featuredPosts[currentIndex];

  return (
    <section
      className={`relative w-full h-64 md:h-80 overflow-hidden ${post.image ? 'bg-cover bg-center' : 'gradient-hero'}`}
      style={post.image ? { backgroundImage: `url(${post.image})` } : undefined}
    >
      <div
        className={`absolute inset-0 ${post.image ? 'bg-gradient-to-t from-black/70 via-black/40 to-black/20' : 'bg-black/30'}`}
      />
      <div className="relative max-w-7xl mx-auto w-full h-full flex items-end px-4 pb-6">
        <div className="text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm opacity-80">By {post.author?.name || 'Anonymous'}</span>
            {post.category && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 border border-white/30">
                {post.category.name}
              </span>
            )}
            {featuredPosts.length > 1 && (
              <span className="text-xs opacity-60 ml-2">
                {currentIndex + 1} / {featuredPosts.length}
              </span>
            )}
          </div>
          <Link href={`/posts/${post.id}`}>
            <h2 className="font-serif text-2xl md:text-4xl font-bold leading-tight hover:underline">
              {post.title}
            </h2>
          </Link>
          <p className="text-sm opacity-80 mt-2 line-clamp-1 max-w-2xl">
            {post.content.replace(/<[^>]*>/g, '').substring(0, 120)}...
          </p>
        </div>
      </div>
      {featuredPosts.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute right-16 bottom-6 text-white/60 hover:text-white transition-colors hidden md:block"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-6 bottom-6 text-white/60 hover:text-white transition-colors hidden md:block"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
    </section>
  );
}
