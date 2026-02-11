import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto w-full py-8 px-4">
      <div className="mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-2">About Hase Forum</h1>
        <p className="text-muted-foreground">
          A modern platform for sharing knowledge and growing together
        </p>
        <span className="accent-line" />
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Our Mission</h2>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Hase Forum is built to elevate the study experience. We believe that knowledge grows
              when shared, and our platform makes it easy for students and learners to exchange
              ideas, ask questions, and help each other across a wide range of academic subjects.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Features</h2>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">Rich Text Posts</strong> — Share detailed notes
                with formatting, code blocks, images, and links
              </li>
              <li>
                <strong className="text-foreground">Anonymous Q&A</strong> — Ask questions without
                revealing your identity
              </li>
              <li>
                <strong className="text-foreground">Threaded Comments</strong> — Engage in
                structured discussions up to 5 levels deep
              </li>
              <li>
                <strong className="text-foreground">Voting System</strong> — Surface the best
                content through community voting
              </li>
              <li>
                <strong className="text-foreground">Categories</strong> — Browse content across
                Math, Science, History, Literature, Languages, and General topics
              </li>
              <li>
                <strong className="text-foreground">Bookmarks</strong> — Save posts for later
                reference
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Contact Us</h2>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Have feedback, suggestions, or need help? We&apos;d love to hear from you.
            </p>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">Email:</strong> support@hase.forum
              </p>
              <p>
                <strong className="text-foreground">GitHub:</strong>{' '}
                <a href="https://github.com/hase-forum" className="text-primary hover:underline">
                  github.com/hase-forum
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Built with Next.js, Prisma, and TailwindCSS</p>
      </div>
    </div>
  );
}
