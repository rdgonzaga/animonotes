export interface NotificationData {
  authorName?: string;
  voterName?: string;
  targetType?: string;
  senderName?: string;
  [key: string]: unknown;
}

export interface Notification {
  id: string;
  type: string;
  data: NotificationData;
  read: boolean;
  createdAt: string;
}
