import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

async function getUser(id: string) {
  const res = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/users/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) return null;
  return res.json();
}

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const user = await getUser(params.id);

  if (!user) {
    notFound();
  }

  const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.image || undefined} alt={user.name} />
              <AvatarFallback className="text-2xl">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground">Joined {joinDate}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-accent rounded-lg">
              <div className="text-2xl font-bold">{user._count.posts}</div>
              <div className="text-sm text-muted-foreground">Posts</div>
            </div>
            <div className="text-center p-4 bg-accent rounded-lg">
              <div className="text-2xl font-bold">{user._count.comments}</div>
              <div className="text-sm text-muted-foreground">Comments</div>
            </div>
            <div className="text-center p-4 bg-accent rounded-lg">
              <div className="text-2xl font-bold">{user.karma}</div>
              <div className="text-sm text-muted-foreground">Karma</div>
            </div>
            <div className="text-center p-4 bg-accent rounded-lg">
              <div className="text-2xl font-bold">{user._count.votesGiven}</div>
              <div className="text-sm text-muted-foreground">Votes Given</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
