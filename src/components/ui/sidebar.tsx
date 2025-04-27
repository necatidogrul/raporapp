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
  ListChecks,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState, createContext, useContext } from "react";
import {
  getUserData,
  getPendingInvitations,
  checkAndPromoteOrganizationManagers,
  getUserOrganizations,
} from "@/lib/firebase-utils";
import { auth } from "@/lib/firebase";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

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
  badge?: string;
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
    badge: "Yeni",
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
  const [isOrgManager, setIsOrgManager] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { isOpen, setIsOpen } = useSidebarStore();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {
      main: true,
      reports: true,
      tasks: true,
      organization: true,
      settings: true,
    }
  );

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
          setIsOrgManager(invitations.length > 0);
        }
      } catch (error) {
        console.error("Kullanıcı bilgileri yüklenirken hata:", error);
      }
    };

    checkUserRole();
  }, []);

  useEffect(() => {
    const checkUserOrganizationRole = async () => {
      try {
        if (auth.currentUser) {
          // Kullanıcının organizasyonlarını getir
          const userOrgs = await getUserOrganizations(auth.currentUser.uid);

          // Kullanıcının yönetici olduğu organizasyon var mı kontrol et
          const hasManagerRole = userOrgs.some(
            (org) => org.managerId === auth.currentUser?.uid
          );

          setIsOrgManager(hasManagerRole);
        }
      } catch (error) {
        console.error("Organizasyon bilgileri yüklenirken hata:", error);
      }
    };

    checkUserOrganizationRole();
  }, []);

  // Route değiştiğinde mobil menüyü kapat
  useEffect(() => {
    setIsOpen(false);
  }, [pathname, setIsOpen]);

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

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  const renderMenuGroup = (
    items: MenuItem[],
    groupTitle?: string,
    group?: string
  ) => {
    if (!items.length) return null;

    const filteredItems = items.filter(
      (item) => item.forAll || (item.onlyManager && (isManager || isOrgManager))
    );

    if (!filteredItems.length) return null;

    const isExpanded = group ? expandedGroups[group] : true;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="mb-4"
      >
        {groupTitle && group && (
          <div
            className="flex items-center justify-between px-3 py-2 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
            onClick={() => toggleGroup(group)}
          >
            <span>{groupTitle}</span>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
        )}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {filteredItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 px-3 py-2 text-sm font-medium transition-all duration-200",
                    pathname === item.href
                      ? "bg-primary/10 text-primary hover:bg-primary/15"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    "group relative overflow-hidden"
                  )}
                  onClick={() => handleNavigation(item.href)}
                >
                  <div className="relative z-10 flex items-center gap-3">
                    <item.icon
                      className={cn(
                        "h-4 w-4",
                        pathname === item.href
                          ? "text-primary"
                          : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />
                    <span>{item.title}</span>
                    {item.badge && (
                      <Badge
                        variant="secondary"
                        className="ml-auto bg-primary/10 text-primary text-xs px-1.5"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  {pathname === item.href && (
                    <motion.div
                      className="absolute inset-0 bg-primary/5"
                      layoutId="sidebar-active"
                      transition={{ type: "spring", duration: 0.5 }}
                    />
                  )}
                </Button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const sidebarContent = (
    <div className="h-screen flex flex-col gap-2 p-4">
      <div className="space-y-2">
        {renderMenuGroup(mainItems)}
        {renderMenuGroup(reportItems, "Raporlar", "reports")}
        {renderMenuGroup(taskItems, "Görevler", "tasks")}
        {renderMenuGroup(orgItems, "Organizasyon", "organization")}
        {renderMenuGroup(settingsItems, "Ayarlar", "settings")}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-72 p-0">
          {sidebarContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="hidden lg:block w-72 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      {sidebarContent}
    </motion.div>
  );
}
