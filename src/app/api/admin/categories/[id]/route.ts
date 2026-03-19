import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/require-permission';
import { updateCategorySchema } from '@/lib/validations/admin';
import { logAdminAction } from '@/features/admin/lib/audit';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { error, session } = await requireAdmin(request);
    if (error) return error;

    const body = await request.json();
    const validation = updateCategorySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed', details: validation.error.issues }, { status: 400 });
    }

    const category = await prisma.category.update({ where: { id }, data: validation.data });

    await logAdminAction({
      actorId: session!.user.id,
      action: 'category.update',
      targetType: 'category',
      targetId: id,
      details: validation.data,
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Category update error:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { error, session } = await requireAdmin(request);
    if (error) return error;

    // Prevent deleting categories with posts
    const postCount = await prisma.post.count({ where: { categoryId: id, deletedAt: null } });
    if (postCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete category with ${postCount} active posts. Merge or move posts first.` },
        { status: 400 },
      );
    }

    await prisma.category.delete({ where: { id } });

    await logAdminAction({
      actorId: session!.user.id,
      action: 'category.delete',
      targetType: 'category',
      targetId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Category delete error:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
