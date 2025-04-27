"use client";

import { useState } from "react";
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
  Settings2,
  Bell,
  Lock,
  Languages,
  Palette,
  Shield,
  AlertTriangle,
  Loader2,
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
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

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
      router.push("/");
    } catch {
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
            <Settings2 className="h-8 w-8 text-violet-600 animate-pulse" />
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-transparent bg-clip-text">
              Ayarlar
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground"
          >
            Uygulama tercihlerinizi özelleştirin
          </motion.p>
        </div>
      </motion.div>

      <motion.div variants={staggerContainer}>
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-violet-50 dark:bg-violet-950/20 p-1 rounded-xl">
            <TabsTrigger
              value="general"
              className="data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-lg transition-all duration-200"
            >
              <Palette className="h-4 w-4 mr-2" />
              Genel
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-lg transition-all duration-200"
            >
              <Bell className="h-4 w-4 mr-2" />
              Bildirimler
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-lg transition-all duration-200"
            >
              <Lock className="h-4 w-4 mr-2" />
              Güvenlik
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="general" key="general" className="space-y-4">
              {/* Tema Ayarları */}
              <motion.div variants={fadeIn}>
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 bg-background/80 backdrop-blur-sm border-violet-200/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5 text-violet-600" />
                      Tema
                    </CardTitle>
                    <CardDescription>
                      Uygulama temasını değiştirin
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      defaultValue={theme}
                      onValueChange={handleThemeChange}
                      className="grid grid-cols-3 gap-4"
                    >
                      <motion.div whileHover={{ scale: 1.02 }}>
                        <RadioGroupItem
                          value="light"
                          id="theme-light"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="theme-light"
                          className="flex flex-col items-center justify-between rounded-xl border-2 border-violet-200 bg-violet-50/50 p-4 hover:bg-violet-100/50 hover:border-violet-300 peer-data-[state=checked]:border-violet-600 peer-data-[state=checked]:bg-violet-100/50 transition-all duration-200"
                        >
                          <Sun className="mb-3 h-6 w-6 text-violet-600" />
                          <span className="text-center font-medium">Açık</span>
                        </Label>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }}>
                        <RadioGroupItem
                          value="dark"
                          id="theme-dark"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="theme-dark"
                          className="flex flex-col items-center justify-between rounded-xl border-2 border-violet-200 bg-violet-50/50 p-4 hover:bg-violet-100/50 hover:border-violet-300 peer-data-[state=checked]:border-violet-600 peer-data-[state=checked]:bg-violet-100/50 transition-all duration-200"
                        >
                          <Moon className="mb-3 h-6 w-6 text-violet-600" />
                          <span className="text-center font-medium">Koyu</span>
                        </Label>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }}>
                        <RadioGroupItem
                          value="system"
                          id="theme-system"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="theme-system"
                          className="flex flex-col items-center justify-between rounded-xl border-2 border-violet-200 bg-violet-50/50 p-4 hover:bg-violet-100/50 hover:border-violet-300 peer-data-[state=checked]:border-violet-600 peer-data-[state=checked]:bg-violet-100/50 transition-all duration-200"
                        >
                          <Monitor className="mb-3 h-6 w-6 text-violet-600" />
                          <span className="text-center font-medium">
                            Sistem
                          </span>
                        </Label>
                      </motion.div>
                    </RadioGroup>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Dil Ayarları */}
              <motion.div variants={fadeIn}>
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 bg-background/80 backdrop-blur-sm border-violet-200/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Languages className="h-5 w-5 text-violet-600" />
                      Dil
                    </CardTitle>
                    <CardDescription>Uygulama dilini seçin</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Select defaultValue="tr">
                      <SelectTrigger className="w-full border-violet-200 focus:ring-violet-200">
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
              </motion.div>
            </TabsContent>

            <TabsContent
              value="notifications"
              key="notifications"
              className="space-y-4"
            >
              <motion.div variants={fadeIn}>
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 bg-background/80 backdrop-blur-sm border-violet-200/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-violet-600" />
                      Bildirim Ayarları
                    </CardTitle>
                    <CardDescription>
                      Hangi bildirimler almak istediğinizi seçin
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-violet-50/50 border border-violet-200"
                    >
                      <div className="space-y-0.5">
                        <Label className="text-base">
                          E-posta Bildirimleri
                        </Label>
                        <CardDescription>
                          Önemli güncellemeler hakkında e-posta alın
                        </CardDescription>
                      </div>
                      <Switch
                        checked={notifications.email}
                        onCheckedChange={(checked) =>
                          handleNotificationChange("email", checked)
                        }
                        className="data-[state=checked]:bg-violet-600"
                      />
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-violet-50/50 border border-violet-200"
                    >
                      <div className="space-y-0.5">
                        <Label className="text-base">
                          Haftalık Rapor Özeti
                        </Label>
                        <CardDescription>
                          Haftalık rapor durumu hakkında bilgi alın
                        </CardDescription>
                      </div>
                      <Switch
                        checked={notifications.reportsWeekly}
                        onCheckedChange={(checked) =>
                          handleNotificationChange("reportsWeekly", checked)
                        }
                        className="data-[state=checked]:bg-violet-600"
                      />
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-violet-50/50 border border-violet-200"
                    >
                      <div className="space-y-0.5">
                        <Label className="text-base">
                          Görev Hatırlatıcıları
                        </Label>
                        <CardDescription>
                          Yaklaşan görevler hakkında hatırlatıcılar alın
                        </CardDescription>
                      </div>
                      <Switch
                        checked={notifications.taskReminders}
                        onCheckedChange={(checked) =>
                          handleNotificationChange("taskReminders", checked)
                        }
                        className="data-[state=checked]:bg-violet-600"
                      />
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="security" key="security" className="space-y-4">
              <motion.div variants={fadeIn}>
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 bg-background/80 backdrop-blur-sm border-violet-200/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5 text-violet-600" />
                      Şifre Değiştir
                    </CardTitle>
                    <CardDescription>
                      Hesap güvenliğiniz için düzenli olarak şifrenizi
                      değiştirin
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <motion.div
                      className="space-y-2"
                      whileHover={{ scale: 1.01 }}
                    >
                      <Label htmlFor="current-password">Mevcut Şifre</Label>
                      <Input
                        id="current-password"
                        type="password"
                        placeholder="••••••••"
                        className="border-violet-200 focus:border-violet-300 focus:ring-violet-200"
                      />
                    </motion.div>

                    <motion.div
                      className="space-y-2"
                      whileHover={{ scale: 1.01 }}
                    >
                      <Label htmlFor="new-password">Yeni Şifre</Label>
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="••••••••"
                        className="border-violet-200 focus:border-violet-300 focus:ring-violet-200"
                      />
                    </motion.div>

                    <motion.div
                      className="space-y-2"
                      whileHover={{ scale: 1.01 }}
                    >
                      <Label htmlFor="confirm-password">Şifreyi Onayla</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                        className="border-violet-200 focus:border-violet-300 focus:ring-violet-200"
                      />
                    </motion.div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button
                      className="bg-violet-600 hover:bg-violet-700 text-white shadow-md"
                      disabled
                    >
                      Şifreyi Güncelle
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>

              <motion.div variants={fadeIn}>
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 bg-background/80 backdrop-blur-sm border-violet-200/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-violet-600" />
                      Hesap Güvenliği
                    </CardTitle>
                    <CardDescription>
                      Hesabınızla ilgili güvenlik ayarları
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-violet-50/50 border border-violet-200"
                    >
                      <div className="space-y-0.5">
                        <Label className="text-base">
                          İki Faktörlü Doğrulama
                        </Label>
                        <CardDescription>
                          Ekstra güvenlik için iki faktörlü doğrulamayı
                          etkinleştirin
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        className="border-violet-200"
                        disabled
                      >
                        Yakında
                      </Button>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-violet-50/50 border border-violet-200"
                    >
                      <div className="space-y-0.5">
                        <Label className="text-base">Oturum Açma Geçmişi</Label>
                        <CardDescription>
                          Son oturum açma aktivitelerinizi görüntüleyin
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        className="border-violet-200"
                        disabled
                      >
                        Yakında
                      </Button>
                    </motion.div>

                    <Separator className="my-6 bg-violet-200/50" />

                    <div className="space-y-4">
                      <motion.div whileHover={{ scale: 1.01 }}>
                        <Button
                          variant="outline"
                          className="w-full border-violet-200 hover:border-violet-300 hover:bg-violet-50"
                          onClick={handleLogout}
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Çıkış Yapılıyor...
                            </>
                          ) : (
                            <>
                              <LogOut className="h-4 w-4 mr-2" />
                              Çıkış Yap
                            </>
                          )}
                        </Button>
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.01 }}>
                        <Button
                          variant="outline"
                          className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={handleDeleteAccount}
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Hesabı Sil
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
