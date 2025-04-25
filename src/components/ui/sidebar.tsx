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
  MenuIcon,
  X,
} from "lucide-react";
import { useEffect, useState, createContext, useContext } from "react";
import {
  getUserData,
  getPendingInvitations,
  checkAndPromoteOrganizationManagers,
} from "@/lib/firebase-utils";
import { auth } from "@/lib/firebase";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

// Sidebar Context oluşturma
type SidebarContextType = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// SidebarProvider bileşeni
export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen((prev) => !prev);

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

// Hook kullanımı için
export function useSidebarStore() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebarStore must be used within a SidebarProvider");
  }
  return context;
}

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
  const [isMobile, setIsMobile] = useState(false);
  const { isOpen, setIsOpen } = useSidebarStore();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    // İlk yükleme sırasında ekran boyutunu kontrol et
    handleResize();

    // Pencere boyutu değiştiğinde kontrol et
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  // Route değiştiğinde mobil menüyü kapat
  useEffect(() => {
    setIsOpen(false);
  }, [pathname, setIsOpen]);

  // Menü öğelerini gruplandır
  const mainItems = menuItems.filter((item) => item.group === "main");
  const reportItems = menuItems.filter((item) => item.group === "reports");
  const taskItems = menuItems.filter((item) => item.group === "tasks");
  const orgItems = menuItems.filter((item) => item.group === "organization");
  const settingsItems = menuItems.filter((item) => item.group === "settings");

  const handleNavigation = (href: string) => {
    router.push(href);
    if (isMobile) {
      setIsOpen(false);
    }
  };

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
            onClick={() => handleNavigation(item.href)}
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

  const sidebarContent = (
    <div className="space-y-6 h-full overflow-y-auto py-4">
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
  );

  // Mobil görünüm için Sheet component'i
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <SheetTitle className="sr-only">Menü</SheetTitle>
          <div className="flex justify-end p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="px-4">{sidebarContent}</div>
        </SheetContent>
      </Sheet>
    );
  }

  // Masaüstü görünümü
  return (
    <div className="hidden lg:block w-64 h-screen bg-background border-r flex-shrink-0 overflow-y-auto">
      <div className="p-4">{sidebarContent}</div>
    </div>
  );
}
