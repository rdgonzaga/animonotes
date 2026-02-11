import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/bookmarks - Get user's bookmarks
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        post: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            _count: {
              select: {
                comments: true,
                votes: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate vote scores for each post
    const bookmarksWithScores = await Promise.all(
      bookmarks.map(async (bookmark) => {
        const votes = await prisma.vote.findMany({
          where: { postId: bookmark.post.id },
          select: { value: true },
        });
        const score = votes.reduce((sum, vote) => sum + vote.value, 0);
        return {
          ...bookmark,
          post: {
            ...bookmark.post,
            score,
          },
        };
      })
    );

    return NextResponse.json(bookmarksWithScores);
  } catch (error) {
    console.error("Bookmarks fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookmarks" },
      { status: 500 }
    );
  }
}
