"use client";

import { auth } from "@/lib/firebase";
import { User, onAuthStateChanged } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader } from "@/components/ui/loader";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Public sayfaları ve route gruplarını tanımla
  // "/" (anasayfa), "/login", "/register" her zaman public
  // Ayrıca bazı API rotaları da public olabilir
  const isPublicPage = (path: string) => {
    return (
      path === "/" || path.startsWith("/login") || path.startsWith("/register")
    );
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Listener'ı component unmount olduğunda temizle
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Yükleme bitmeden işlem yapma
    if (loading) return;

    // Eğer sayfa public ise, authentication kontrolü yapma
    if (isPublicPage(pathname)) return;

    // Kullanıcı yoksa ve korumalı bir sayfadaysa login'e yönlendir
    if (!user) {
      console.log(`Redirecting to login from: ${pathname}`);
      const redirectPath = `/login?callbackUrl=${encodeURIComponent(pathname)}`;
      router.replace(redirectPath);
    }
  }, [user, loading, pathname, router]);

  // Public sayfalar için yükleme durumunda bile direk içeriği göster
  if (loading && isPublicPage(pathname)) {
    return <>{children}</>;
  }

  // Korumalı sayfalar için yükleme durumunda spinner göster
  if (loading) {
    return <Loader className="h-screen" text="" />;
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
