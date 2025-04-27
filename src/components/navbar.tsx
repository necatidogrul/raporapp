"use client";

import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import {
  Moon,
  Sun,
  LogOut,
  User,
  Menu,
  Search,
  Sparkles,
  Bell,
  Settings,
} from "lucide-react";
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
import { FileText } from "lucide-react";
import { NotificationDrawer } from "@/components/notifications/NotificationDrawer";
import { useNotificationStore } from "@/store/notification-store";
import { fetchUserNotifications } from "@/store/notification-store";
import { useSidebarStore } from "@/components/ui/sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { CommandMenu } from "@/components/search/command-menu";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { setNotifications } = useNotificationStore();
  const { toggleSidebar } = useSidebarStore();
  const [userName, setUserName] = useState<string>("");
  const [userInitials, setUserInitials] = useState<string>("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
          setNotifications([]);
        }
      }
    };

    loadNotifications();

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
      router.push("/");
    } catch {
      toast.error("Çıkış yapılırken bir hata oluştu");
    }
  };

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "sticky top-0 z-40 w-full border-b transition-all duration-200",
        isScrolled
          ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          : "bg-background"
      )}
    >
      <div className="flex h-16">
        <div className="w-72 flex items-center px-4 border-r">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden hover:bg-muted/50 rounded-full mr-3"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/40 via-purple-500/40 to-blue-500/40 blur-xl rounded-full group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-gradient-to-r from-primary via-purple-500 to-blue-500 text-primary-foreground rounded-xl p-2 shadow-lg shadow-primary/20">
                <FileText className="h-6 w-6" />
              </div>
            </motion.div>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold bg-gradient-to-r from-primary via-purple-500 to-blue-500 text-transparent bg-clip-text tracking-tight"
            >
              Raporla
            </motion.span>
          </motion.div>
        </div>

        <div className="flex-1 flex items-center justify-between px-4">
          <div className="flex-1 flex items-center justify-center px-4 max-w-2xl">
            <CommandMenu />
          </div>

          <div className="flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full hover:bg-muted/50"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={theme}
                    initial={{ opacity: 0, rotate: -180 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    {theme === "dark" ? (
                      <Sun className="h-5 w-5" />
                    ) : (
                      <Moon className="h-5 w-5" />
                    )}
                  </motion.div>
                </AnimatePresence>
              </Button>
            </motion.div>

            <NotificationDrawer />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    className="relative rounded-full p-0 hover:bg-muted/50"
                  >
                    <Avatar className="h-8 w-8 transition-all duration-200 ring-2 ring-primary/20 hover:ring-primary/40">
                      <AvatarImage
                        src={auth.currentUser?.photoURL || ""}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 mt-2 border border-primary/20 bg-background/95 backdrop-blur-sm"
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {userName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {auth.currentUser?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => router.push("/profile")}
                  className="gap-2 cursor-pointer hover:bg-muted/50"
                >
                  <User className="h-4 w-4" />
                  <span>Profil</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => router.push("/settings")}
                  className="gap-2 cursor-pointer hover:bg-muted/50"
                >
                  <Settings className="h-4 w-4" />
                  <span>Ayarlar</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={handleLogout}
                  className="gap-2 cursor-pointer text-red-500 hover:bg-red-500/10 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Çıkış Yap</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
