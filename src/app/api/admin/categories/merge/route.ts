import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/require-permission';
import { mergeCategoriesSchema } from '@/lib/validations/admin';
import { logAdminAction } from '@/features/admin/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const { error, session } = await requireAdmin(request);
    if (error) return error;

    const body = await request.json();
    const validation = mergeCategoriesSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed', details: validation.error.issues }, { status: 400 });
    }

    const { sourceId, targetId } = validation.data;

    const [source, target] = await Promise.all([
      prisma.category.findUnique({ where: { id: sourceId } }),
      prisma.category.findUnique({ where: { id: targetId } }),
    ]);

    if (!source) return NextResponse.json({ error: 'Source category not found' }, { status: 404 });
    if (!target) return NextResponse.json({ error: 'Target category not found' }, { status: 404 });

    const result = await prisma.$transaction(async (tx) => {
      const movedPosts = await tx.post.updateMany({
        where: { categoryId: sourceId },
        data: { categoryId: targetId },
      });
      await tx.category.delete({ where: { id: sourceId } });
      return movedPosts;
    });

    await logAdminAction({
      actorId: session!.user.id,
      action: 'category.merge',
      targetType: 'category',
      targetId: targetId,
      details: { sourceId, sourceName: source.name, targetName: target.name, movedPosts: result.count },
    });

    return NextResponse.json({ success: true, movedPosts: result.count });
  } catch (error) {
    console.error('Category merge error:', error);
    return NextResponse.json({ error: 'Failed to merge categories' }, { status: 500 });
  }
}
