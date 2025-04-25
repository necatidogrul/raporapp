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

// Login, register gibi herkese açık sayfaları tanımla
// Ayrıca API rotalarını da ekleyebilirsin, örn: /api/auth
const publicPaths = ["/login", "/register"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Listener'ı component unmount olduğunda temizle
    return () => unsubscribe();
  }, []); // Bağımlılıkları kaldır, yalnızca mount/unmount'ta çalışsın

  useEffect(() => {
    // Yükleme bitmeden veya kullanıcı zaten varsa işlem yapma
    if (loading || user) return;

    // Mevcut yol public değilse ve kök dizin de değilse login'e yönlendir
    const isPublic = publicPaths.some((path) => pathname.startsWith(path));
    const isRoot = pathname === "/"; // Ana sayfa her zaman public kabul edilebilir

    if (!isPublic && !isRoot) {
      console.log(`Redirecting to login from: ${pathname}`); // Debug için log
      const redirectPath = `/login?callbackUrl=${encodeURIComponent(pathname)}`;
      router.replace(redirectPath);
    }
  }, [user, loading, pathname, router]); // Bu effect kullanıcı, yükleme durumu veya yol değiştiğinde çalışsın

  // Anasayfa için yükleme göstergesini gösterme
  if (loading) {
    const isRoot = pathname === "/";
    if (isRoot) {
      return <>{children}</>;
    }
    return <Loader className="h-screen" text="" />;
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
