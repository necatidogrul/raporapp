export type NotificationType =
  | "REPORT_SUBMITTED"
  | "REPORT_APPROVED"
  | "REPORT_REJECTED"
  | "TASK_ASSIGNED"
  | "TASK_COMPLETED"
  | "ORG_INVITATION";

export type NotificationStatus = "READ" | "UNREAD";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  status: NotificationStatus;
  createdAt: Date;
  readAt?: Date;
  relatedItemId?: string; // İlgili rapor, görev veya davet ID'si
  relatedItemType?: "REPORT" | "TASK" | "INVITATION";
  senderName?: string;
  senderUserId?: string;
}

export interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  setNotifications: (notifications: Notification[]) => void;
  updateUnreadCount: () => void;
}
