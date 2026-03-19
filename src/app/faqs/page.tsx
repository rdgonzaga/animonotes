import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Sidebar } from '@/components/layout/sidebar';

const faqs = [
  {
    question: 'What is AnimoNotes?',
    answer:
      'AnimoNotes is a modern note-sharing platform designed for students and learners. Share knowledge, ask questions, and grow together across academic subjects like Math, Science, History, Literature, Languages, and more.',
  },
  {
    question: 'How do I create a post?',
    answer:
      'Click the "Write" button in the navigation bar. You\'ll be taken to a rich text editor where you can compose your post, select a category, and publish it for the community.',
  },
  {
    question: 'What is Anonymous Q&A?',
    answer:
      'Anonymous Q&A allows you to ask questions without revealing your identity. Your name is never stored with anonymous posts. You can edit or delete your anonymous posts only from the same browser session.',
  },
  {
    question: 'How does voting work?',
    answer:
      'You can upvote or downvote posts and comments. Upvotes increase the score and help surface quality content. Downvotes decrease the score. You can change or remove your vote at any time.',
  },
  {
    question: 'Can I bookmark posts?',
    answer:
      'Yes! Click the bookmark icon on any post to save it for later. Access your saved posts from the "Bookmarks" section in your profile menu.',
  },
  {
    question: 'How do I search for content?',
    answer:
      'Use the search bar at the top of the page. You can search for posts by title or content, and find other users by name. Results appear instantly as you type.',
  },
  {
    question: 'Is my data safe?',
    answer:
      'We use industry-standard security practices including password hashing, JWT session management, and input validation. Anonymous posts are truly anonymous — even administrators cannot see who posted them.',
  },
  {
    question: 'How do I delete my account?',
    answer:
      'Account deletion is currently disabled because accounts are managed through Google OAuth. If you need help with account access, contact support.',
  },
];

export default function FAQsPage() {
  return (
    <div className="max-w-7xl mx-auto w-full px-4 py-6">
      <div className="flex gap-6">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <div className="mb-8">
            <h1 className="font-sans text-3xl sm:text-4xl font-bold mb-2">
              Frequently Asked Questions
            </h1>
            <p className="text-muted-foreground">Everything you need to know about AnimoNotes</p>
            <span className="accent-line" />
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <h2 className="text-lg font-semibold">{faq.question}</h2>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-8 border-dashed">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                Still have questions? Reach out to us through the{' '}
                <a href="/about" className="text-primary hover:underline">
                  Contact page
                </a>
                .
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
