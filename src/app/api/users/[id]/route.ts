import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/users/[id] - Get user profile
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
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

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Calculate karma (simplified: upvotes on user's posts and comments)
    const userPosts = await prisma.post.findMany({
      where: { authorId: params.id },
      select: {
        votes: {
          select: { value: true },
        },
      },
    });

    const userComments = await prisma.comment.findMany({
      where: { authorId: params.id },
      select: {
        votes: {
          select: { value: true },
        },
      },
    });

    const karma = [
      ...userPosts.flatMap((p) => p.votes),
      ...userComments.flatMap((c) => c.votes),
    ].reduce((sum, vote) => sum + vote.value, 0);

    return NextResponse.json({
      ...user,
      karma,
    });
  } catch (error) {
    console.error("User fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PATCH /api/users/[id] - Update user profile
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.id !== params.id) {
      return NextResponse.json(
        { error: "Forbidden - can only edit own profile" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, image } = body;

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(image && { image }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("User update error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Soft delete user account
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.id !== params.id) {
      return NextResponse.json(
        { error: "Forbidden - can only delete own account" },
        { status: 403 }
      );
    }

    // Soft delete user
    await prisma.user.update({
      where: { id: params.id },
      data: {
        deletedAt: new Date(),
        email: `deleted_${params.id}@deleted.com`, // Anonymize email
        name: "[Deleted User]",
        image: null,
      },
    });

    // Anonymize posts (keep content, remove author link)
    await prisma.post.updateMany({
      where: { authorId: params.id },
      data: { authorId: null },
    });

    // Anonymize comments (keep content, remove author link)
    await prisma.comment.updateMany({
      where: { authorId: params.id },
      data: { authorId: null },
    });

    return NextResponse.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("User deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
