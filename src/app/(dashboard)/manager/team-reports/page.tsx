"use client";

import { useEffect, useState, useCallback } from "react";
import { auth } from "@/lib/firebase";
import {
  getUserOrganizations,
  getOrganizationMembers,
  getManagerReports,
  Organization,
  UserData,
  Report,
  getUserData,
} from "@/lib/firebase-utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  FileTextIcon,
  CheckIcon,
  XIcon,
  AlertTriangleIcon,
  CalendarIcon,
  RefreshCw,
  UsersIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  Building2,
  BarChart3,
  Clock,
  Filter,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  format,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  subDays,
  addDays,
  previousFriday,
  nextFriday,
} from "date-fns";
import { tr } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Loader } from "@/components/ui/loader";
import { motion, AnimatePresence } from "framer-motion";

export default function TeamReportsPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const [selectedOrgData, setSelectedOrgData] = useState<Organization | null>(
    null
  );
  const [members, setMembers] = useState<UserData[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentWeekDate, setCurrentWeekDate] = useState<Date>(
    previousFriday(new Date())
  );
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalReports: 0,
    submittedThisWeek: 0,
    pendingThisWeek: 0,
    completionRate: 0,
  });

  // İstatistikleri hesapla
  const calculateStats = useCallback(
    (members: UserData[], reports: Report[]) => {
      const totalMembers = members.length;
      const totalReports = reports.length;

      // Bu haftanın başlangıç ve bitiş tarihleri
      const weekStart = startOfWeek(currentWeekDate, { weekStartsOn: 1 }); // Pazartesi
      const weekEnd = endOfWeek(currentWeekDate, { weekStartsOn: 1 }); // Pazar

      // Bu hafta gönderilen raporlar
      const thisWeekReports = reports.filter((report) => {
        if (!report.createdAt) return false;

        const reportDate = report.createdAt.toDate();
        return isWithinInterval(reportDate, { start: weekStart, end: weekEnd });
      });

      const submittedThisWeek = thisWeekReports.length;
      const pendingThisWeek = totalMembers - submittedThisWeek;
      const completionRate =
        totalMembers > 0 ? (submittedThisWeek / totalMembers) * 100 : 0;

      setStats({
        totalMembers,
        totalReports,
        submittedThisWeek,
        pendingThisWeek,
        completionRate,
      });
    },
    [currentWeekDate]
  );

  // Firebase bağlantısını kontrol et
  useEffect(() => {
    const checkFirebaseConnection = async () => {
      try {
        if (!auth.currentUser) {
          router.push("/login");
          return;
        }

        // Kullanıcı rolünü kontrol et
        try {
          const userData = await getUserData(auth.currentUser.uid);

          if (userData?.role !== "manager") {
            toast.error("Bu sayfaya erişmek için yönetici olmanız gerekiyor");
            setLoading(false);
            return;
          }
        } catch (userError) {
          console.error("Kullanıcı verileri alınırken hata:", userError);
          toast.error("Kullanıcı bilgileri alınamadı");
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error("Firebase bağlantısı kontrol edilirken hata:", error);
        toast.error("Firebase bağlantısı kurulamadı");
        setLoading(false);
      }
    };

    checkFirebaseConnection();
  }, [router]);

  // Organizasyonları yükle
  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        if (!auth.currentUser) {
          setLoading(false);
          return;
        }

        const orgList = await getUserOrganizations(auth.currentUser.uid);

        // Sadece yönetici olduğu organizasyonları filtrele
        const managerOrgs = orgList.filter(
          (org) => org.managerId === auth.currentUser?.uid
        );

        setOrganizations(managerOrgs);

        if (managerOrgs.length > 0 && !selectedOrg) {
          setSelectedOrg(managerOrgs[0].id);
          setSelectedOrgData(managerOrgs[0]);
        } else if (managerOrgs.length === 0) {
          setLoading(false);
        }
      } catch (error) {
        console.error("Organizasyonlar yüklenirken hata:", error);
        toast.error("Organizasyonlar yüklenirken bir hata oluştu");
        setLoading(false);
      }
    };

    loadOrganizations();
  }, [selectedOrg]);

  // Seçili organizasyonun üyelerini ve raporlarını yükle
  useEffect(() => {
    if (!selectedOrg) {
      return;
    }

    const loadMembersAndReports = async () => {
      // Sadece ilk yüklemede loading state'ini true yap
      if (!reports.length) {
        setLoading(true);
      }
      try {
        // Üyeleri yükle
        const memberList = await getOrganizationMembers(selectedOrg);

        // Yöneticiyi listeden çıkar
        const filteredMembers = memberList.filter(
          (member) => member.id !== auth.currentUser?.uid
        );
        setMembers(filteredMembers);

        // Raporları yükle
        if (auth.currentUser) {
          const reportList = await getManagerReports(auth.currentUser.uid);

          // Sadece seçili organizasyona ait raporları filtrele
          const orgReports = reportList.filter(
            (report) => report.organizationId === selectedOrg
          );
          setReports(orgReports);

          // İstatistikleri hesapla
          calculateStats(filteredMembers, orgReports);
        }
      } catch (error) {
        console.error("Veriler yüklenirken hata:", error);
        toast.error("Veriler yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    loadMembersAndReports();
  }, [selectedOrg, calculateStats]);

  const handleRefresh = async () => {
    if (!selectedOrg || !auth.currentUser) return;

    setRefreshing(true);
    try {
      // Üyeleri yükle
      const memberList = await getOrganizationMembers(selectedOrg);
      // Yöneticiyi listeden çıkar
      const filteredMembers = memberList.filter(
        (member) => member.id !== auth.currentUser?.uid
      );
      setMembers(filteredMembers);

      // Raporları yükle
      const reportList = await getManagerReports(auth.currentUser.uid);
      // Sadece seçili organizasyona ait raporları filtrele
      const orgReports = reportList.filter(
        (report) => report.organizationId === selectedOrg
      );
      setReports(orgReports);

      // İstatistikleri hesapla
      calculateStats(filteredMembers, orgReports);

      toast.success("Veriler yenilendi");
    } catch (error) {
      console.error("Veriler yenilenirken hata:", error);
      toast.error("Veriler yenilenirken bir hata oluştu");
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewReport = (reportId: string) => {
    router.push(`/manager/reports/${reportId}`);
  };

  const handleSelectOrganization = (orgId: string) => {
    setSelectedOrg(orgId);
    const org = organizations.find((o) => o.id === orgId);
    if (org) {
      setSelectedOrgData(org);
    }
  };

  const handleSelectWeek = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setCurrentWeekDate((prevDate) => {
        // Önceki Cuma gününe git
        return previousFriday(subDays(prevDate, 7));
      });
    } else {
      // Gelecekteki tarihlere de izin ver
      const nextDate = nextFriday(addDays(currentWeekDate, 1));
      setCurrentWeekDate(nextDate);
    }
  };

  // Üyenin belirli bir hafta için rapor gönderip göndermediğini kontrol et
  const getMemberReportStatus = (memberId: string, weekDate: Date) => {
    try {
      // Haftanın başlangıç ve bitiş tarihleri (Pazartesi-Pazar)
      const weekStart = startOfWeek(weekDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(weekDate, { weekStartsOn: 1 });

      // Üyenin bu hafta için gönderdiği raporları bul
      const memberReports = reports.filter((report) => {
        // Temel kontroller
        if (report.userId !== memberId) return false;

        // Rapor tarihi kontrolü
        if (!report.createdAt) return false;

        const reportDate = report.createdAt.toDate();
        return isWithinInterval(reportDate, { start: weekStart, end: weekEnd });
      });

      if (memberReports.length === 0) {
        return { status: "NOT_SUBMITTED", report: null };
      }

      const report = memberReports[0];
      return { status: report.status, report };
    } catch {
      return { status: "NOT_SUBMITTED", report: null };
    }
  };

  // Rapor durumuna göre badge oluştur
  const getStatusBadge = (status: string | undefined) => {
    switch (status) {
      case "NOT_SUBMITTED":
        return (
          <Badge variant="outline" className="bg-gray-100">
            Gönderilmedi
          </Badge>
        );
      case "UNREAD":
      case "READ":
      case "SUBMITTED":
        return <Badge variant="secondary">Gönderildi</Badge>;
      case "APPROVED":
        return <Badge variant="success">Onaylandı</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Reddedildi</Badge>;
      default:
        return <Badge variant="outline">Bilinmiyor</Badge>;
    }
  };

  // Rapor durumuna göre icon oluştur
  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case "NOT_SUBMITTED":
        return <AlertTriangleIcon className="h-5 w-5 text-gray-400" />;
      case "UNREAD":
      case "READ":
      case "SUBMITTED":
        return <FileTextIcon className="h-5 w-5 text-blue-500" />;
      case "APPROVED":
        return <CheckIcon className="h-5 w-5 text-green-500" />;
      case "REJECTED":
        return <XIcon className="h-5 w-5 text-red-500" />;
      default:
        return <FileTextIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  // Hafta bilgisini formatla
  const formatWeekInfo = (date: Date) => {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Pazartesi
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 }); // Pazar
    return `${format(weekStart, "d MMMM", { locale: tr })} - ${format(
      weekEnd,
      "d MMMM yyyy",
      { locale: tr }
    )}`;
  };

  if (loading) {
    return <Loader className="p-6" />;
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col gap-2">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2"
        >
          <Sparkles className="h-8 w-8 text-primary animate-pulse" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-500 to-blue-500 text-transparent bg-clip-text">
            Takım Raporları
          </h1>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground"
        >
          Ekibinizin haftalık rapor durumlarını takip edin ve performansı analiz
          edin.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
      >
        <Select value={selectedOrg} onValueChange={handleSelectOrganization}>
          <SelectTrigger className="w-full sm:w-[240px] bg-background/50 backdrop-blur-sm">
            <SelectValue placeholder="Organizasyon seçin" />
          </SelectTrigger>
          <SelectContent>
            {organizations.map((org) => (
              <SelectItem key={org.id} value={org.id}>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {org.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleSelectWeek("prev")}
            className="bg-background/50 backdrop-blur-sm hover:bg-background/80"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="bg-background/50 backdrop-blur-sm hover:bg-background/80"
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            {formatWeekInfo(currentWeekDate)}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleSelectWeek("next")}
            className="bg-background/50 backdrop-blur-sm hover:bg-background/80"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            className={`bg-background/50 backdrop-blur-sm hover:bg-background/80 ${
              refreshing ? "animate-spin" : ""
            }`}
            disabled={refreshing}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          >
            <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Toplam Üye
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <UsersIcon className="h-4 w-4 text-primary" />
                  <span className="text-2xl font-bold">
                    {stats.totalMembers}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-primary/10 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Bu Hafta Gönderilen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-blue-500" />
                  <span className="text-2xl font-bold">
                    {stats.submittedThisWeek}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Bekleyen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span className="text-2xl font-bold">
                    {stats.pendingThisWeek}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Tamamlanma Oranı
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-green-500" />
                    <span className="text-2xl font-bold">
                      %{Math.round(stats.completionRate)}
                    </span>
                  </div>
                  <Progress value={stats.completionRate} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid gap-4"
          >
            <Card className="overflow-hidden border-none bg-gradient-to-br from-background to-background/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-purple-600 text-transparent bg-clip-text">
                  Üye Durumları
                </CardTitle>
                <CardDescription>
                  {selectedOrgData?.name} organizasyonundaki üyelerin rapor
                  durumları
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <AnimatePresence>
                    {members.map((member, index) => {
                      const status = getMemberReportStatus(
                        member.id,
                        currentWeekDate
                      );
                      return (
                        <motion.div
                          key={member.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="group"
                        >
                          <Card className="bg-card/50 hover:bg-card/80 transition-all duration-300">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                                      <UsersIcon className="h-5 w-5 text-primary" />
                                    </div>
                                    {status.report?.status === "SUBMITTED" && (
                                      <div className="absolute -bottom-1 -right-1">
                                        <CheckIcon className="h-4 w-4 text-green-500" />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <h3 className="font-medium group-hover:text-primary transition-colors">
                                      {member.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                      {member.title || "Üye"}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {getStatusBadge(status.report?.status)}
                                  {status.report && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        handleViewReport(status.report!.id)
                                      }
                                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <ChevronRightIcon className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </div>
  );
}
