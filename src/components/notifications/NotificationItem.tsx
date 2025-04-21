"use client";

import { Notification } from "@/types/notification";
import { useNotificationStore } from "@/store/notification-store";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import {
  FileText,
  Check,
  X,
  User,
  BellRing,
  CheckCheck,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface NotificationItemProps {
  notification: Notification;
  onClose?: () => void;
}

export function NotificationItem({
  notification,
  onClose,
}: NotificationItemProps) {
  const { markAsRead, deleteNotification } = useNotificationStore();
  const router = useRouter();

  // Bildirim tipine göre ikon belirle
  const getIcon = () => {
    switch (notification.type) {
      case "REPORT_SUBMITTED":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "REPORT_APPROVED":
        return <Check className="h-5 w-5 text-green-500" />;
      case "REPORT_REJECTED":
        return <X className="h-5 w-5 text-red-500" />;
      case "TASK_ASSIGNED":
        return <User className="h-5 w-5 text-purple-500" />;
      case "TASK_COMPLETED":
        return <CheckCheck className="h-5 w-5 text-green-500" />;
      case "ORG_INVITATION":
        return <Users className="h-5 w-5 text-orange-500" />;
      default:
        return <BellRing className="h-5 w-5 text-gray-500" />;
    }
  };

  // Bildirimin oluşturulma zamanını "5 dakika önce" gibi formatta göster
  const getTimeAgo = () => {
    return formatDistanceToNow(notification.createdAt, {
      addSuffix: true,
      locale: tr,
    });
  };

  // Bildirime tıklandığında
  const handleClick = () => {
    // Eğer bildirim okunmamışsa, okundu olarak işaretle
    if (notification.status === "UNREAD") {
      markAsRead(notification.id);
    }

    // İlgili sayfaya yönlendir
    if (notification.relatedItemType && notification.relatedItemId) {
      switch (notification.relatedItemType) {
        case "REPORT":
          router.push(`/reports/${notification.relatedItemId}`);
          break;
        case "TASK":
          router.push(`/tasks/${notification.relatedItemId}`);
          break;
        case "INVITATION":
          // Davetiyeler için ID tabanlı sayfa yerine ana davetiyeler sayfasına yönlendir
          router.push(`/invitations`);
          break;
      }
    }

    // Eğer onClose callback'i tanımlanmışsa çağır (drawer'ı kapatmak için)
    if (onClose) {
      onClose();
    }
  };

  // Bildirimi sil
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification(notification.id);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "flex items-start gap-3 p-3 rounded-md transition-colors hover:bg-muted cursor-pointer relative group",
        notification.status === "UNREAD" ? "bg-primary/5" : ""
      )}
    >
      <div className="mt-0.5 flex-shrink-0">{getIcon()}</div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h4 className="font-medium text-sm">{notification.title}</h4>
          <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
            {getTimeAgo()}
          </span>
        </div>

        <p className="text-xs text-muted-foreground mt-1 truncate">
          {notification.message}
        </p>

        {notification.senderName && (
          <p className="text-xs mt-1">
            <span className="text-muted-foreground">Gönderen: </span>
            {notification.senderName}
          </p>
        )}
      </div>

      {notification.status === "UNREAD" && (
        <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-primary"></span>
      )}

      <button
        onClick={handleDelete}
        className="opacity-0 group-hover:opacity-100 absolute top-3 right-3 p-1 rounded-full hover:bg-muted-foreground/20 transition-opacity"
        aria-label="Bildirimi sil"
      >
        <X className="h-3 w-3 text-muted-foreground" />
      </button>
    </div>
  );
}
