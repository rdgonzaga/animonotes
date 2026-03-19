export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  postCount: number;
  createdAt: string;
}

export interface CategoryBuilderProps {
  initialCategories?: AdminCategory[];
}

export interface CategoryFormProps {
  category?: AdminCategory;
  onSubmit: (data: { name: string; slug: string; description?: string }) => Promise<void>;
  onClose: () => void;
}

export interface MergeCategoryDialogProps {
  sourceCategory: AdminCategory;
  categories: AdminCategory[];
  onMerge: (sourceId: string, targetId: string) => Promise<void>;
  onClose: () => void;
}
