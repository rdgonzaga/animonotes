import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';
import { SendMessageButton } from '@/components/messages/send-message-button';

export const dynamic = 'force-dynamic';

async function getUser(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        image: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            comments: true,
            votes: true,
          },
        },
      },
    });

    if (!user) return null;

    // Calculate karma
    const userPosts = await prisma.post.findMany({
      where: { authorId: id },
      select: { votes: { select: { value: true } } },
    });
    const userComments = await prisma.comment.findMany({
      where: { authorId: id },
      select: { votes: { select: { value: true } } },
    });
    const karma = [
      ...userPosts.flatMap((p) => p.votes),
      ...userComments.flatMap((c) => c.votes),
    ].reduce((sum, vote) => sum + vote.value, 0);

    return { ...user, karma };
  } catch {
    return null;
  }
}

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser(id);

  if (!user) {
    notFound();
  }

  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });

  return (
    <div className="max-w-4xl mx-auto w-full py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
              <AvatarFallback className="text-2xl">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground mb-3">Joined {joinDate}</p>
              <SendMessageButton recipientId={user.id} recipientName={user.name || 'this user'} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <div className="text-2xl font-bold text-foreground">{user._count.posts}</div>
              <div className="text-sm text-muted-foreground">Posts</div>
            </div>
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <div className="text-2xl font-bold text-foreground">{user._count.comments}</div>
              <div className="text-sm text-muted-foreground">Comments</div>
            </div>
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <div className="text-2xl font-bold text-foreground">{user.karma}</div>
              <div className="text-sm text-muted-foreground">Karma</div>
            </div>
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <div className="text-2xl font-bold text-foreground">{user._count.votes}</div>
              <div className="text-sm text-muted-foreground">Votes Given</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
