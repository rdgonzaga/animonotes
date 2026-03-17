export type TrashItemType = 'post' | 'comment' | 'user';

export interface TrashItem {
  id: string;
  type: TrashItemType;
  preview: string;
  deletedAt: string;
  ageInDays: number;
  canHardDelete: boolean;
  authorName?: string | null;
}

export interface TrashFilter {
  type?: TrashItemType | 'all';
  page: number;
  limit: number;
}

export interface TrashBinProps {
  initialItems?: TrashItem[];
}

export interface RestoreDialogProps {
  item: TrashItem;
  onRestore: (id: string, type: TrashItemType) => Promise<void>;
  onClose: () => void;
}

export interface HardDeleteDialogProps {
  item: TrashItem;
  onHardDelete: (id: string, type: TrashItemType) => Promise<void>;
  onClose: () => void;
}
