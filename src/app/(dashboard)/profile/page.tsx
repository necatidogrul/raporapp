"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { getUserData, updateUserData } from "@/lib/firebase-utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Mail,
  Phone,
  Building,
  Shield,
  Sparkles,
  Briefcase,
  UserCircle2,
} from "lucide-react";
import { UploadCloudIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    title: "",
    department: "",
    photoURL: "",
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        if (auth.currentUser) {
          const data = await getUserData(auth.currentUser.uid);
          if (data) {
            setUserData({
              name: data.name || "",
              email: auth.currentUser.email || "",
              phone: data.phone || "",
              title: data.title || "",
              department: data.department || "",
              photoURL: data.photoURL || "",
            });
          }
        } else {
          router.push("/login");
        }
      } catch {
        toast.error("Profil bilgileri yüklenirken hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      if (!auth.currentUser) {
        router.push("/login");
        return;
      }

      await updateUserData(auth.currentUser.uid, {
        name: userData.name,
        phone: userData.phone,
        title: userData.title,
        department: userData.department,
        photoURL: userData.photoURL,
      });

      toast.success("Profil bilgileri güncellendi");
    } catch {
      toast.error("Profil güncellenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const getUserInitials = () => {
    if (!userData.name) return "?";
    return userData.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading && !userData.name) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <motion.div initial="initial" animate="animate" className="p-6 space-y-8">
      {/* Üst banner */}
      <motion.div
        variants={fadeIn}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 p-8 rounded-2xl shadow-lg backdrop-blur-sm border border-violet-200/20"
      >
        <div className="space-y-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <UserCircle2 className="h-8 w-8 text-violet-600 animate-pulse" />
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-transparent bg-clip-text">
              Profil Bilgilerim
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground"
          >
            Kişisel bilgilerinizi yönetin ve güncelleyin
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <Badge
            variant="secondary"
            className="bg-violet-100 text-violet-700 flex items-center gap-1"
          >
            <Shield className="h-3 w-3" />
            Hesap Doğrulandı
          </Badge>
        </motion.div>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        className="grid md:grid-cols-3 gap-6"
      >
        {/* Profil Özeti */}
        <motion.div variants={fadeIn} className="md:col-span-1">
          <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 bg-background/80 backdrop-blur-sm border-violet-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-violet-600" />
                Profil
              </CardTitle>
              <CardDescription>Kişisel bilgileriniz</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative group"
              >
                <Avatar className="h-24 w-24 ring-4 ring-violet-100 ring-offset-2 transition-all duration-200 group-hover:ring-violet-200">
                  <AvatarImage src={userData.photoURL} />
                  <AvatarFallback className="text-lg bg-gradient-to-br from-violet-600 to-purple-600 text-white font-semibold">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute -top-2 -right-2"
                >
                  <Badge className="bg-violet-600">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Pro
                  </Badge>
                </motion.div>
              </motion.div>
              <div className="text-center space-y-2">
                <p className="font-semibold text-lg">{userData.name}</p>
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Mail className="h-3 w-3" />
                  {userData.email}
                </p>
                {userData.title && (
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    {userData.title}
                    {userData.department && (
                      <>
                        <span className="mx-1">·</span>
                        {userData.department}
                      </>
                    )}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                className="w-full mt-4 border-violet-200 hover:border-violet-300 hover:bg-violet-50"
                disabled
              >
                <UploadCloudIcon className="h-4 w-4 mr-2 text-violet-600" />
                Fotoğraf Yükle
                <span className="text-xs ml-2 text-muted-foreground">
                  (Yakında)
                </span>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Profil Bilgileri */}
        <motion.div variants={fadeIn} className="md:col-span-2">
          <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 bg-background/80 backdrop-blur-sm border-violet-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-violet-600" />
                Bilgilerimi Düzenle
              </CardTitle>
              <CardDescription>
                Profil bilgilerinizi güncelleyin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <motion.div className="space-y-2" whileHover={{ scale: 1.01 }}>
                <Label htmlFor="name">Ad Soyad</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-violet-600" />
                  <Input
                    id="name"
                    name="name"
                    placeholder="Adınız Soyadınız"
                    className="pl-10 border-violet-200 focus:border-violet-300 focus:ring-violet-200"
                    value={userData.name}
                    onChange={handleChange}
                  />
                </div>
              </motion.div>

              <motion.div className="space-y-2" whileHover={{ scale: 1.01 }}>
                <Label htmlFor="email">E-posta</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-violet-600" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="ornek@email.com"
                    className="pl-10 bg-violet-50/50"
                    value={userData.email}
                    disabled
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  E-posta adresiniz değiştirilemez
                </p>
              </motion.div>

              <Separator className="my-6 bg-violet-200/50" />

              <motion.div className="space-y-2" whileHover={{ scale: 1.01 }}>
                <Label htmlFor="title">Pozisyon</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 h-4 w-4 text-violet-600" />
                  <Input
                    id="title"
                    name="title"
                    placeholder="Yazılım Geliştirici"
                    className="pl-10 border-violet-200 focus:border-violet-300 focus:ring-violet-200"
                    value={userData.title}
                    onChange={handleChange}
                  />
                </div>
              </motion.div>

              <motion.div className="space-y-2" whileHover={{ scale: 1.01 }}>
                <Label htmlFor="department">Departman</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-violet-600" />
                  <Input
                    id="department"
                    name="department"
                    placeholder="Bilgi Teknolojileri"
                    className="pl-10 border-violet-200 focus:border-violet-300 focus:ring-violet-200"
                    value={userData.department}
                    onChange={handleChange}
                  />
                </div>
              </motion.div>

              <motion.div className="space-y-2" whileHover={{ scale: 1.01 }}>
                <Label htmlFor="phone">Telefon (İsteğe Bağlı)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-violet-600" />
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="+90 555 123 4567"
                    className="pl-10 border-violet-200 focus:border-violet-300 focus:ring-violet-200"
                    value={userData.phone}
                    onChange={handleChange}
                  />
                </div>
              </motion.div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                onClick={handleSaveProfile}
                disabled={loading}
                className="bg-violet-600 hover:bg-violet-700 text-white shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  "Değişiklikleri Kaydet"
                )}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
