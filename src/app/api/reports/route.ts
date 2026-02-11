import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { createReportSchema } from '@/lib/validations/report';

// POST /api/reports - Create report
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createReportSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { reason, postId, commentId, userId } = validation.data;

    // Check if already reported by this user
    const existing = await prisma.report.findFirst({
      where: {
        reporterId: session.user.id,
        ...(postId && { postId }),
        ...(commentId && { commentId }),
        ...(userId && { userId }),
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'You have already reported this' }, { status: 409 });
    }

    const report = await prisma.report.create({
      data: {
        reporterId: session.user.id,
        reason,
        postId,
        commentId,
        userId,
        status: 'PENDING',
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('Report creation error:', error);
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
  }
}

// GET /api/reports - Get reports (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    const isAdmin = session?.user?.role?.toLowerCase() === 'admin';
    if (!session?.user || !isAdmin) {
      return NextResponse.json({ error: 'Forbidden - admin only' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'PENDING';

    const reports = await prisma.report.findMany({
      where: {
        status: status as any,
      },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
          },
        },
        comment: {
          select: {
            id: true,
            content: true,
          },
        },
        reportedUser: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Reports fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}
