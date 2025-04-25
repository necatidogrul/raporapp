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
import { Loader2 } from "lucide-react";
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
      // Firebase Auth ile kullanıcı oluştur
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Kullanıcı profilini güncelle
      await updateProfile(userCredential.user, {
        displayName: name,
      });

      // Firestore'a kullanıcı bilgilerini kaydet
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-800 dark:via-gray-900 dark:to-black px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-xl dark:border dark:border-gray-700">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold">Raporla</CardTitle>
          <CardDescription>Yeni hesap oluştur</CardDescription>
        </CardHeader>
        <CardContent>
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
                className="w-full"
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
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Kayıt Ol"
              )}
            </Button>
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              Zaten hesabınız var mı?{" "}
              <Link
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                Giriş yapın
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
