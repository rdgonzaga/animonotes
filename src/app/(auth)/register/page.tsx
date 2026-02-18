'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authClient } from '@/lib/auth-client';

const SECURITY_QUESTIONS = [
  "What is your mother's maiden name?",
  'What was the name of your first pet?',
  'What city were you born in?',
  'What is your favorite book?',
  'What was your childhood nickname?',
];

export default function RegisterPage() {
  const router = useRouter();
  type SignUpPayload = Parameters<typeof authClient.signUp.email>[0] & {
    securityQuestion: string;
    securityAnswer: string;
  };
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    securityQuestion: SECURITY_QUESTIONS[0],
    securityAnswer: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const name = formData.email.split('@')[0] || 'User';
      const signUpPayload: SignUpPayload = {
        name,
        email: formData.email,
        password: formData.password,
        securityQuestion: formData.securityQuestion,
        securityAnswer: formData.securityAnswer,
      };

      const { error: signUpError } = await authClient.signUp.email(signUpPayload);

      if (signUpError) {
        setError(signUpError.message || 'Registration failed');
        setLoading(false);
        return;
      }

      router.push('/login?registered=true');
    } catch {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="font-serif text-4xl font-bold text-primary">Animo Notes</h1>
          </Link>
          <span className="accent-line mx-auto mt-3" />
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-serif text-2xl">Create an Account</CardTitle>
            <CardDescription>Join the community and start discussing</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min 8 chars, 1 uppercase, 1 number, 1 special"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="securityQuestion">Security Question</Label>
                <select
                  id="securityQuestion"
                  className="w-full h-10 px-3 py-2 text-sm border border-input bg-background text-foreground rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  value={formData.securityQuestion}
                  onChange={(e) => setFormData({ ...formData, securityQuestion: e.target.value })}
                >
                  {SECURITY_QUESTIONS.map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="securityAnswer">Security Answer</Label>
                <Input
                  id="securityAnswer"
                  type="text"
                  placeholder="Your answer"
                  value={formData.securityAnswer}
                  onChange={(e) => setFormData({ ...formData, securityAnswer: e.target.value })}
                  required
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating account...' : 'Register'}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
