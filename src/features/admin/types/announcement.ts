export type AnnouncementType = 'info' | 'warning' | 'urgent';

export interface AdminAnnouncement {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  isActive: boolean;
  startsAt: string;
  endsAt: string | null;
  createdAt: string;
  creator: { id: string; name: string | null };
}

export interface AnnouncementFormProps {
  announcement?: AdminAnnouncement;
  onSubmit: (data: { title: string; content: string; type: AnnouncementType; endsAt?: string }) => Promise<void>;
  onClose: () => void;
}

export interface AnnouncementBannerProps {
  announcement: AdminAnnouncement;
  onDismiss: (id: string) => void;
}
