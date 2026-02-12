'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Search, Navigation, PenSquare, Download, Users, Feather } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
        setLoading(false);
        return;
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/' });
  };

  const features = [
    { icon: Search, label: 'Search' },
    { icon: Navigation, label: 'Browse' },
    { icon: PenSquare, label: 'Post' },
    { icon: Download, label: 'Download' },
    { icon: Users, label: 'Anonymize' },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Green gradient hero section */}
      <section className="relative gradient-hero py-16 md:py-24 overflow-hidden">
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
            Elevating the study experience
          </h1>

          {/* Glassmorphism card */}
          <div className="glass rounded-2xl p-8 max-w-sm mx-auto">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full border-2 border-white/40 flex items-center justify-center">
                <Feather className="h-8 w-8 text-white/80" />
              </div>
            </div>
            <p className="text-white/90 font-medium mb-6">Share knowledge, grow together</p>

            {!showSignIn ? (
              <>
                <Button
                  className="w-full bg-white text-foreground hover:bg-white/90 rounded-lg gap-2 mb-3"
                  onClick={handleGoogleSignIn}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Sign up with Google
                </Button>
                <p className="text-white/70 text-sm">
                  Already have an account?{' '}
                  <button
                    onClick={() => setShowSignIn(true)}
                    className="text-white font-medium underline"
                  >
                    Sign in
                  </button>
                </p>
              </>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 text-left">
                {registered && (
                  <div className="text-sm text-white bg-white/20 p-2 rounded-lg text-center">
                    Registration successful! Please sign in.
                  </div>
                )}
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30"
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30"
                  />
                </div>
                {error && (
                  <div className="text-sm text-white bg-red-500/30 p-2 rounded-lg text-center">
                    {error}
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full bg-white text-foreground hover:bg-white/90 rounded-lg"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
                <p className="text-white/70 text-sm text-center">
                  <button
                    type="button"
                    onClick={() => setShowSignIn(false)}
                    className="text-white font-medium underline"
                  >
                    Back to sign up
                  </button>
                  {' · '}
                  <Link href="/register" className="text-white font-medium underline">
                    Register
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="bg-background py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-serif text-2xl md:text-4xl text-primary mb-12">
            Stop scrambling and start{' '}
            <span className="underline decoration-primary/30 decoration-2 underline-offset-4">
              sharing
            </span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-6">
            {features.map((feature) => (
              <div key={feature.label} className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full border-2 border-primary/30 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm font-medium text-primary">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
