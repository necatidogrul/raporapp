"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Inbox,
  Building2,
  Mail,
  Settings,
  FileText,
  FileBarChart,
  User,
  UserPlus,
  ListChecks,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  getUserData,
  getPendingInvitations,
  checkAndPromoteOrganizationManagers,
} from "@/lib/firebase-utils";
import { auth } from "@/lib/firebase";

type MenuItem = {
  title: string;
  href: string;
  icon: React.ElementType;
  forAll?: boolean;
  onlyManager?: boolean;
  group: string;
};

const menuItems: MenuItem[] = [
  // Ana menü öğeleri
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    forAll: true,
    group: "main",
  },

  // Raporlar grubu
  {
    title: "Raporlarım",
    href: "/reports",
    icon: FileText,
    forAll: true,
    group: "reports",
  },
  {
    title: "Gelen Raporlar",
    href: "/manager/reports",
    icon: Inbox,
    onlyManager: true,
    group: "reports",
  },
  {
    title: "Takım Raporları",
    href: "/manager/team-reports",
    icon: FileBarChart,
    onlyManager: true,
    group: "reports",
  },

  // Görevler ve takvim
  {
    title: "Görevler",
    href: "/tasks",
    icon: ListChecks,
    forAll: true,
    group: "tasks",
  },
  {
    title: "Takvim",
    href: "/calendar",
    icon: Calendar,
    forAll: true,
    group: "tasks",
  },

  // Organizasyon ve kullanıcı yönetimi
  {
    title: "Organizasyonlar",
    href: "/organizations",
    icon: Building2,
    forAll: true,
    group: "organization",
  },
  {
    title: "Davetiyeler",
    href: "/invitations",
    icon: Mail,
    forAll: true,
    group: "organization",
  },
  {
    title: "Kullanıcılar",
    href: "/users",
    icon: UserPlus,
    onlyManager: true,
    group: "organization",
  },

  // Kullanıcı ayarları
  {
    title: "Profil",
    href: "/profile",
    icon: User,
    forAll: true,
    group: "settings",
  },
  {
    title: "Ayarlar",
    href: "/settings",
    icon: Settings,
    forAll: true,
    group: "settings",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isManager, setIsManager] = useState(false);
  const [hasPendingInvitations, setHasPendingInvitations] = useState(false);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        if (auth.currentUser) {
          const userData = await getUserData(auth.currentUser.uid);

          const isUserManager = userData?.role === "manager";
          if (!isUserManager) {
            const isPromoted = await checkAndPromoteOrganizationManagers();
            setIsManager(isPromoted || false);
          } else {
            setIsManager(true);
          }

          // Bekleyen davetiyeleri kontrol et
          const invitations = await getPendingInvitations(auth.currentUser.uid);
          setHasPendingInvitations(invitations.length > 0);
        }
      } catch (error) {
        console.error("Kullanıcı bilgileri yüklenirken hata:", error);
      }
    };

    checkUserRole();
  }, []);

  // Menü öğelerini gruplandır
  const mainItems = menuItems.filter((item) => item.group === "main");
  const reportItems = menuItems.filter((item) => item.group === "reports");
  const taskItems = menuItems.filter((item) => item.group === "tasks");
  const orgItems = menuItems.filter((item) => item.group === "organization");
  const settingsItems = menuItems.filter((item) => item.group === "settings");

  const renderMenuGroup = (items: MenuItem[]) => {
    return items.map((item: MenuItem) => {
      // Sadece yöneticilere özel menü itemlarını kontrol et
      if (item.onlyManager && !isManager) return null;
      // Herkes için olan menü itemlarını göster
      if (item.forAll || (item.onlyManager && isManager)) {
        return (
          <Button
            key={item.href}
            variant={pathname === item.href ? "default" : "ghost"}
            className={cn(
              "w-full justify-start gap-2",
              pathname === item.href && "bg-primary text-primary-foreground"
            )}
            onClick={() => router.push(item.href)}
          >
            <item.icon className="h-5 w-5" />
            <span className="flex-1 text-left">{item.title}</span>
            {item.href === "/invitations" && hasPendingInvitations && (
              <span className="w-2 h-2 rounded-full bg-red-500" />
            )}
          </Button>
        );
      }
      return null;
    });
  };

  return (
    <div className="w-64 h-screen bg-background border-r flex flex-col p-4">
      <div className="space-y-6">
        <div className="space-y-2">{renderMenuGroup(mainItems)}</div>

        {reportItems.some(
          (item) => item.forAll || (item.onlyManager && isManager)
        ) && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground px-2 mb-1">
              RAPORLAR
            </div>
            {renderMenuGroup(reportItems)}
          </div>
        )}

        {taskItems.some(
          (item) => item.forAll || (item.onlyManager && isManager)
        ) && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground px-2 mb-1">
              GÖREVLER
            </div>
            {renderMenuGroup(taskItems)}
          </div>
        )}

        {orgItems.some(
          (item) => item.forAll || (item.onlyManager && isManager)
        ) && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground px-2 mb-1">
              ORGANİZASYON
            </div>
            {renderMenuGroup(orgItems)}
          </div>
        )}

        {settingsItems.some(
          (item) => item.forAll || (item.onlyManager && isManager)
        ) && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground px-2 mb-1">
              HESAP
            </div>
            {renderMenuGroup(settingsItems)}
          </div>
        )}
      </div>
    </div>
  );
}
