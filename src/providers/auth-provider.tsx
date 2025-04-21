"use client";

import { auth } from "@/lib/firebase";
import { User, onAuthStateChanged } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

const publicPaths = ["/", "/login", "/register"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Hidrasyon sorunlarını önlemek için bir sonraki tick'e erteleme
    const timeoutId = setTimeout(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);

        if (!user && !publicPaths.includes(pathname)) {
          const loginUrl = new URL("/login", window.location.origin);
          loginUrl.searchParams.set("callbackUrl", pathname);
          router.replace(loginUrl.toString());
        }
      });

      return () => unsubscribe();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
