"use client";

import React from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { BellRing } from "lucide-react";
import { NotificationList } from "./NotificationList";
import { useNotificationStore } from "@/store/notification-store";
import { auth } from "@/lib/firebase";

export function NotificationDrawer() {
  const [open, setOpen] = React.useState(false);
  const { unreadCount } = useNotificationStore();

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full relative">
          <BellRing className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center">
              <span className="absolute animate-ping h-2 w-2 rounded-full bg-primary opacity-75"></span>
              <span className="relative rounded-full h-2 w-2 bg-primary"></span>
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="p-0 sm:max-w-md flex flex-col"
        aria-label="Bildirimler"
      >
        <div className="flex-1 overflow-hidden">
          <NotificationList onClose={handleClose} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
