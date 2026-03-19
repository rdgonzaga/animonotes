import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;

// GET /api/users/username-availability?username=<username>&excludeUserId=<id>
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawUsername = (searchParams.get('username') || '').trim();
    const excludeUserId = (searchParams.get('excludeUserId') || '').trim();

    if (!USERNAME_REGEX.test(rawUsername)) {
      return NextResponse.json(
        {
          available: false,
          normalizedUsername: rawUsername.toLowerCase(),
          message:
            'Username must be 3-30 characters and contain only letters, numbers, and underscores.',
        },
        { status: 400 }
      );
    }

    const normalizedUsername = rawUsername.toLowerCase();
    const existingUser = await prisma.$queryRaw<Array<{ id: string }>>(
      Prisma.sql`
        SELECT "id"
        FROM "User"
        WHERE LOWER(COALESCE("username", '')) = ${normalizedUsername}
        ${excludeUserId ? Prisma.sql`AND "id" <> ${excludeUserId}` : Prisma.empty}
        LIMIT 1
      `
    );

    return NextResponse.json({
      available: existingUser.length === 0,
      normalizedUsername,
    });
  } catch (error) {
    console.error('Username availability error:', error);
    return NextResponse.json({ error: 'Failed to check username availability' }, { status: 500 });
  }
}
