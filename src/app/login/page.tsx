"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, AuthError } from "firebase/auth";
import { createOrUpdateUser } from "@/lib/firebase-utils";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      // Kullanıcı bilgilerini Firestore'a kaydet/güncelle
      await createOrUpdateUser(userCredential.user);
      toast.success("Giriş başarılı!");

      // URL'den callbackUrl parametresini al
      const urlParams = new URLSearchParams(window.location.search);
      const callbackUrl = urlParams.get("callbackUrl");

      // Güvenli URL kontrolü - yalnızca site içi yönlendirmelere izin ver
      const isSafeUrl =
        callbackUrl &&
        !callbackUrl.startsWith("http") &&
        !callbackUrl.startsWith("//");

      // Eğer güvenli bir callbackUrl varsa, oraya yönlendir, yoksa dashboard'a git
      setTimeout(() => {
        if (isSafeUrl) {
          router.replace(callbackUrl);
        } else {
          router.replace("/dashboard");
        }
      }, 100); // küçük bir gecikme ekleyerek tarayıcının durumunu güncellemeye zaman tanı
    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = "Giriş yapılırken bir hata oluştu";

      // Daha ayrıntılı hata mesajları
      if (authError.code === "auth/invalid-credential") {
        errorMessage = "E-posta veya şifre hatalı";
      } else if (authError.code === "auth/user-not-found") {
        errorMessage = "Bu e-posta adresi ile bir kullanıcı bulunamadı";
      } else if (authError.code === "auth/wrong-password") {
        errorMessage = "Hatalı şifre girdiniz";
      } else if (authError.code === "auth/too-many-requests") {
        errorMessage =
          "Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin";
      } else if (authError.code === "auth/user-disabled") {
        errorMessage = "Bu hesap devre dışı bırakılmış";
      } else if (authError.code === "auth/network-request-failed") {
        errorMessage = "Ağ hatası. İnternet bağlantınızı kontrol edin";
      }

      console.error("Login error:", authError.code, authError.message);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-center">
            Raporla
          </CardTitle>
          <CardDescription className="text-center">
            İş takip sistemine hoş geldiniz
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                E-posta
              </label>
              <Input
                type="email"
                placeholder="ornek@sirket.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Şifre
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>
            <div className="text-center text-sm">
              Hesabınız yok mu?{" "}
              <Link href="/register" className="text-blue-600 hover:underline">
                Kayıt olun
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
