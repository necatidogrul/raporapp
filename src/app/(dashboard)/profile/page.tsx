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
import { User, Mail, Phone, Building } from "lucide-react";
import { UploadCloudIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
      } catch (error) {
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
    } catch (error) {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Profil Bilgilerim</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Profil Özeti */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profil</CardTitle>
            <CardDescription>Kişisel bilgileriniz</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={userData.photoURL} />
              <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="font-medium text-lg">{userData.name}</p>
              <p className="text-sm text-muted-foreground">{userData.email}</p>
              {userData.title && (
                <p className="text-sm text-muted-foreground mt-1">
                  {userData.title}{" "}
                  {userData.department ? `· ${userData.department}` : ""}
                </p>
              )}
            </div>
            <Button variant="outline" className="w-full mt-4" disabled>
              <UploadCloudIcon className="h-4 w-4 mr-2" />
              Fotoğraf Yükle
              <span className="text-xs ml-2 text-muted-foreground">
                (Yakında)
              </span>
            </Button>
          </CardContent>
        </Card>

        {/* Profil Bilgileri */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Bilgilerimi Düzenle</CardTitle>
            <CardDescription>Profil bilgilerinizi güncelleyin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ad Soyad</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  placeholder="Adınız Soyadınız"
                  className="pl-10"
                  value={userData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="ornek@email.com"
                  className="pl-10"
                  value={userData.email}
                  disabled
                />
              </div>
              <p className="text-xs text-muted-foreground">
                E-posta adresiniz değiştirilemez
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="title">Pozisyon</Label>
              <Input
                id="title"
                name="title"
                placeholder="Yazılım Geliştirici"
                value={userData.title}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Departman</Label>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="department"
                  name="department"
                  placeholder="Bilgi Teknolojileri"
                  className="pl-10"
                  value={userData.department}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefon (İsteğe Bağlı)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  name="phone"
                  placeholder="+90 555 123 4567"
                  className="pl-10"
                  value={userData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleSaveProfile} disabled={loading}>
              {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
