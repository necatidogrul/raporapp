"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Moon,
  Sun,
  Monitor,
  LogOut,
  BellRing,
  Mail,
  Lock,
  Shield,
  Languages,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    reportsWeekly: true,
    taskReminders: true,
  });

  const handleThemeChange = (value: string) => {
    setTheme(value);
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
    toast.success("Bildirim ayarları güncellendi");
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      toast.error("Çıkış yapılırken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    toast("Bu özellik henüz geliştirme aşamasındadır", {
      description: "Hesap silme işlemi şu anda yapılamıyor.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Ayarlar</h1>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">Genel</TabsTrigger>
          <TabsTrigger value="notifications">Bildirimler</TabsTrigger>
          <TabsTrigger value="security">Güvenlik</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          {/* Tema Ayarları */}
          <Card>
            <CardHeader>
              <CardTitle>Tema</CardTitle>
              <CardDescription>Uygulama temasını değiştirin</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                defaultValue={theme}
                onValueChange={handleThemeChange}
                className="grid grid-cols-3 gap-4"
              >
                <div>
                  <RadioGroupItem
                    value="light"
                    id="theme-light"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="theme-light"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Sun className="mb-3 h-6 w-6" />
                    <span className="text-center">Açık</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="dark"
                    id="theme-dark"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="theme-dark"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Moon className="mb-3 h-6 w-6" />
                    <span className="text-center">Koyu</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="system"
                    id="theme-system"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="theme-system"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Monitor className="mb-3 h-6 w-6" />
                    <span className="text-center">Sistem</span>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Dil Ayarları */}
          <Card>
            <CardHeader>
              <CardTitle>Dil</CardTitle>
              <CardDescription>Uygulama dilini seçin</CardDescription>
            </CardHeader>
            <CardContent>
              <Select defaultValue="tr">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Dil seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tr">Türkçe</SelectItem>
                  <SelectItem value="en" disabled>
                    English (Yakında)
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bildirim Ayarları</CardTitle>
              <CardDescription>
                Hangi bildirimler almak istediğinizi seçin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>E-posta Bildirimleri</Label>
                  <CardDescription>
                    Önemli güncellemeler hakkında e-posta alın
                  </CardDescription>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("email", checked)
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Haftalık Rapor Özeti</Label>
                  <CardDescription>
                    Haftalık rapor durumu hakkında bilgi alın
                  </CardDescription>
                </div>
                <Switch
                  checked={notifications.reportsWeekly}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("reportsWeekly", checked)
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Görev Hatırlatıcıları</Label>
                  <CardDescription>
                    Yaklaşan görevler hakkında hatırlatıcılar alın
                  </CardDescription>
                </div>
                <Switch
                  checked={notifications.taskReminders}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("taskReminders", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Şifre Değiştir</CardTitle>
              <CardDescription>
                Hesap güvenliğiniz için düzenli olarak şifrenizi değiştirin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Mevcut Şifre</Label>
                <Input
                  id="current-password"
                  type="password"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">Yeni Şifre</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Yeni Şifreyi Onayla</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() =>
                  toast("Bu özellik henüz geliştirme aşamasındadır")
                }
              >
                Şifreyi Değiştir
              </Button>
            </CardFooter>
          </Card>

          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Dikkat</AlertTitle>
            <AlertDescription>
              Hesabınızı silmek geri alınamaz bir işlemdir. Tüm verileriniz
              kalıcı olarak silinecektir.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Hesabı Sil</CardTitle>
              <CardDescription>
                Hesabınızı ve tüm verilerinizi kalıcı olarak silin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Hesabınızı sildiğinizde, tüm kişisel bilgileriniz, raporlarınız
                ve görevleriniz kalıcı olarak silinecektir. Bu işlem geri
                alınamaz.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="destructive" onClick={handleDeleteAccount}>
                Hesabı Sil
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Oturumu Kapat</CardTitle>
              <CardDescription>
                Güvenli bir şekilde oturumunuzu sonlandırın
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Oturumunuzu kapattığınızda, tekrar giriş yapmanız gerekecektir.
              </p>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                onClick={handleLogout}
                disabled={loading}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {loading ? "Çıkış yapılıyor..." : "Çıkış Yap"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
