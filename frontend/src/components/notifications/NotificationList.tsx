"use client";

import { useNotificationStore } from "@/store/notification-store";
import { NotificationItem } from "./NotificationItem";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Inbox, Check } from "lucide-react";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface NotificationListProps {
  onClose?: () => void;
}

export function NotificationList({ onClose }: NotificationListProps) {
  const { notifications, markAllAsRead, unreadCount } = useNotificationStore();

  // Bildirimleri grupla: önce okunmamışlar, sonra okunmuşlar
  const sortedNotifications = [...notifications].sort((a, b) => {
    // Önce duruma göre sırala (okunmamışlar önce)
    if (a.status === "UNREAD" && b.status !== "UNREAD") return -1;
    if (a.status !== "UNREAD" && b.status === "UNREAD") return 1;

    // Aynı durumdalarsa, oluşturulma tarihine göre sırala (yeniler önce)
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return (
    <div className="flex flex-col h-full">
      {/* Başlık ve Tümünü Okundu İşaretle Butonu */}
      <SheetHeader className="px-4 pt-4 pb-2 border-b flex-shrink-0">
        <div className="flex justify-between items-center">
          <SheetTitle>Bildirimler</SheetTitle>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead()}
              className="h-8 text-xs"
            >
              <Check className="mr-1 h-3.5 w-3.5" />
              Tümünü okundu işaretle
            </Button>
          )}
        </div>
      </SheetHeader>

      {/* Bildirim Listesi */}
      <ScrollArea className="flex-1">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="bg-muted/50 rounded-full p-4 mb-3">
              <Inbox className="h-8 w-8 text-muted-foreground" />
            </div>
            <h4 className="text-lg font-medium mb-1">Bildirim Bulunmuyor</h4>
            <p className="text-sm text-muted-foreground">
              Şu anda görüntülenecek bildiriminiz bulunmuyor.
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {sortedNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClose={onClose}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
