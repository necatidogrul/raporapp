"use client";

import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Moon, Sun, LogOut, User, Menu, Search } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { getUserData } from "@/lib/firebase-utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Settings, FileText } from "lucide-react";
import { NotificationDrawer } from "@/components/notifications/NotificationDrawer";
import { useNotificationStore } from "@/store/notification-store";
import { fetchUserNotifications } from "@/store/notification-store";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { setNotifications } = useNotificationStore();
  const [userName, setUserName] = useState<string>("");
  const [userInitials, setUserInitials] = useState<string>("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userData = await getUserData(auth.currentUser.uid);
        if (userData) {
          setUserName(userData.name);
          const initials = userData.name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
          setUserInitials(initials);
        }
      }
    };

    fetchUserData();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Kullanıcının bildirimlerini yükle
  useEffect(() => {
    const loadNotifications = async () => {
      if (auth.currentUser) {
        try {
          const notifications = await fetchUserNotifications(
            auth.currentUser.uid
          );
          setNotifications(notifications);
        } catch (error) {
          console.error("Bildirimler yüklenirken hata oluştu:", error);
          // Hata oluşsa bile boş bir bildirim listesi ayarla
          setNotifications([]);

          // Firebase'in kurulumunu kontrol et hatası gösterme
          // toast.error("Bildirim sistemi geçici olarak kullanılamıyor");
        }
      }
    };

    loadNotifications();

    // Kullanıcı giriş durumu değiştiğinde bildirimleri yeniden yükle
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadNotifications();
      } else {
        setNotifications([]);
      }
    });

    return () => unsubscribe();
  }, [setNotifications]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch {
      toast.error("Çıkış yapılırken bir hata oluştu");
    }
  };

  return (
    <div
      className={cn(
        "sticky top-0 z-40 w-full border-b transition-all duration-200",
        isScrolled ? "bg-background/95 backdrop-blur-sm" : "bg-background"
      )}
    >
      <div className="flex h-16 items-center px-4 lg:px-6">
        {/* Logo Bölümü */}
        <div className="flex items-center gap-2 font-semibold">
          <div className="bg-primary text-primary-foreground rounded-lg p-1">
            <FileText className="h-6 w-6" />
          </div>
          <span className="hidden md:inline-block text-lg">Raporla</span>
        </div>

        {/* Mobil Menü Düğmesi */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden ml-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Arama Kutusu - Orta Bölüm */}
        <div className="hidden md:flex flex-1 items-center justify-center px-4">
          <div className="w-full max-w-sm relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Görev veya rapor ara..."
              className="pl-8 w-full bg-muted/40"
            />
          </div>
        </div>

        {/* Sağ Taraf İkonlar */}
        <div className="flex items-center gap-3 ml-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Bildirim Drawer'ı */}
          <NotificationDrawer />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full p-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={auth.currentUser?.photoURL || ""} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{userName}</span>
                  <span className="text-xs text-muted-foreground">
                    {auth.currentUser?.email}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => router.push("/profile")}>
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => router.push("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Ayarlar</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Çıkış Yap</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobil Menü */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t py-2 px-4 space-y-2">
          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Görev veya rapor ara..."
              className="pl-8 w-full bg-muted/40"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => router.push("/profile")}
          >
            <User className="mr-2 h-4 w-4" />
            <span>Profil</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => router.push("/settings")}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Ayarlar</span>
          </Button>
        </div>
      )}
    </div>
  );
}
