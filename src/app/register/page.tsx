"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { createOrUpdateUser } from "@/lib/firebase-utils";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Loader2, Sparkles, ArrowRight, ArrowLeft, Shield } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await updateProfile(userCredential.user, {
        displayName: name,
      });

      await createOrUpdateUser(userCredential.user);

      toast.success("Kayıt başarılı!");
      router.push("/dashboard");
    } catch (error: unknown) {
      let errorMessage = "Kayıt olurken bir hata oluştu";

      if (error instanceof Error) {
        if (error.message.includes("auth/email-already-in-use")) {
          errorMessage = "Bu e-posta adresi zaten kullanımda";
        } else if (error.message.includes("auth/weak-password")) {
          errorMessage = "Şifre en az 6 karakter olmalıdır";
        } else if (error.message.includes("auth/invalid-email")) {
          errorMessage = "Geçersiz e-posta adresi";
        }
      }

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
            Yeni hesap oluştur
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Ad Soyad
              </label>
              <Input
                type="text"
                placeholder="Ad Soyad"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                E-posta
              </label>
              <Input
                type="email"
                placeholder="ornek@sirket.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
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
                className="w-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                required
                minLength={6}
              />
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <Shield className="w-3 h-3" />
                Şifreniz en az 6 karakter olmalıdır
              </p>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:opacity-90 transition-opacity"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Kayıt Ol"
              )}
            </Button>
            <div className="text-center space-y-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Zaten hesabınız var mı?{" "}
                <Link
                  href="/login"
                  className="font-medium text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1 group"
                >
                  Giriş yapın
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                <Shield className="w-3 h-3" />
                Verileriniz güvenle saklanır
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
