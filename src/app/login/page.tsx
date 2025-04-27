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
import { Loader2, Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
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
      await createOrUpdateUser(userCredential.user);
      toast.success("Giriş başarılı!");

      const urlParams = new URLSearchParams(window.location.search);
      const callbackUrl = urlParams.get("callbackUrl");
      const isSafeUrl =
        callbackUrl &&
        !callbackUrl.startsWith("http") &&
        !callbackUrl.startsWith("//");

      if (isSafeUrl) {
        router.replace(callbackUrl);
      } else {
        router.replace("/dashboard");
      }
    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = "Giriş yapılırken bir hata oluştu";

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-black px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(56,189,248,0.1),rgba(168,85,247,0.1))]" />
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black,transparent)]" />

      {/* Back to home button */}
      <Link
        href="/"
        className="absolute top-4 left-4 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Ana Sayfa</span>
      </Link>

      <Card className="w-full max-w-md shadow-2xl dark:border dark:border-gray-700 relative bg-white/80 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-xl" />
        <CardHeader className="space-y-2 text-center relative">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="relative">
              <Sparkles className="w-6 h-6 text-blue-600 animate-pulse" />
              <div className="absolute inset-0 w-full h-full bg-blue-600/20 blur-xl rounded-full" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-transparent bg-clip-text">
              Raporla
            </CardTitle>
          </div>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            İş takip sistemine hoş geldiniz
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                E-posta
              </label>
              <Input
                type="email"
                placeholder="ornek@sirket.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
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
                className="w-full bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:opacity-90 transition-opacity"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Giriş Yap"
              )}
            </Button>
            <div className="text-center space-y-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Hesabınız yok mu?{" "}
                <Link
                  href="/register"
                  className="font-medium text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1 group"
                >
                  Kayıt olun
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <Link
                href="#"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors block"
              >
                Şifrenizi mi unuttunuz?
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
