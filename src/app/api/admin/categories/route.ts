import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/require-permission';
import { createCategorySchema } from '@/lib/validations/admin';
import { logAdminAction } from '@/features/admin/lib/audit';

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin(request);
    if (error) return error;

    const categories = await prisma.category.findMany({
      include: { _count: { select: { posts: true } } },
      orderBy: { name: 'asc' },
    });

    const result = categories.map((c) => ({
      ...c,
      postCount: c._count.posts,
      _count: undefined,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Categories fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error, session } = await requireAdmin(request);
    if (error) return error;

    const body = await request.json();
    const validation = createCategorySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed', details: validation.error.issues }, { status: 400 });
    }

    const category = await prisma.category.create({ data: validation.data });

    await logAdminAction({
      actorId: session!.user.id,
      action: 'category.create',
      targetType: 'category',
      targetId: category.id,
      details: { name: category.name, slug: category.slug },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Category create error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
