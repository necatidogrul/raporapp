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
  const [error, setError] = useState<string | null>(null);
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
        console.log("Firebase bağlantısı kontrol ediliyor...");

        if (!auth.currentUser) {
          console.log(
            "Kullanıcı giriş yapmamış, giriş sayfasına yönlendiriliyor"
          );
          router.push("/login");
          return;
        }

        // Kullanıcı rolünü kontrol et
        try {
          const userData = await getUserData(auth.currentUser.uid);
          console.log("Kullanıcı verileri:", userData);

          if (userData?.role !== "manager") {
            setError("Bu sayfaya erişmek için yönetici olmanız gerekiyor");
            setLoading(false);
            return;
          }
        } catch (userError) {
          console.error("Kullanıcı verileri alınırken hata:", userError);
          setError("Kullanıcı bilgileri alınamadı");
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error("Firebase bağlantısı kontrol edilirken hata:", error);
        setError("Firebase bağlantısı kurulamadı");
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
          console.log("Kullanıcı giriş yapmamış");
          setLoading(false);
          return;
        }

        console.log("Organizasyonlar yükleniyor...");
        const orgList = await getUserOrganizations(auth.currentUser.uid);
        console.log("Yüklenen organizasyonlar:", orgList);

        // Sadece yönetici olduğu organizasyonları filtrele
        const managerOrgs = orgList.filter(
          (org) => org.managerId === auth.currentUser?.uid
        );
        console.log("Yönetici olduğu organizasyonlar:", managerOrgs);

        setOrganizations(managerOrgs);

        if (managerOrgs.length > 0 && !selectedOrg) {
          console.log("İlk organizasyon seçiliyor:", managerOrgs[0].id);
          setSelectedOrg(managerOrgs[0].id);
          setSelectedOrgData(managerOrgs[0]);
        } else if (managerOrgs.length === 0) {
          console.log("Yönetici olduğu organizasyon bulunamadı");
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
      console.log("Seçili organizasyon yok, üyeler ve raporlar yüklenmiyor");
      return;
    }

    const loadMembersAndReports = async () => {
      setLoading(true);
      try {
        console.log(
          "Seçili organizasyon için üyeler ve raporlar yükleniyor:",
          selectedOrg
        );

        // Üyeleri yükle
        console.log("Üyeler yükleniyor...");
        const memberList = await getOrganizationMembers(selectedOrg);
        console.log("Yüklenen üyeler:", memberList);

        // Yöneticiyi listeden çıkar
        const filteredMembers = memberList.filter(
          (member) => member.id !== auth.currentUser?.uid
        );
        console.log("Filtrelenmiş üyeler:", filteredMembers);
        setMembers(filteredMembers);

        // Raporları yükle
        if (auth.currentUser) {
          console.log("Raporlar yükleniyor...");
          const reportList = await getManagerReports(auth.currentUser.uid);
          console.log("Yüklenen raporlar:", reportList);

          // Sadece seçili organizasyona ait raporları filtrele
          const orgReports = reportList.filter(
            (report) => report.organizationId === selectedOrg
          );
          console.log("Organizasyon raporları:", orgReports);
          setReports(orgReports);

          // İstatistikleri hesapla
          calculateStats(filteredMembers, orgReports);
        } else {
          console.log("Kullanıcı giriş yapmamış, raporlar yüklenemiyor");
        }
      } catch (error) {
        console.error("Veriler yüklenirken hata:", error);
        toast.error("Veriler yüklenirken bir hata oluştu");
      } finally {
        console.log("Yükleme tamamlandı, loading durumu false yapılıyor");
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
    } catch (error) {
      console.error("Rapor durumu kontrol edilirken hata:", error);
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

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6 text-center text-red-500">
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return <Loader className="p-6" />;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Organizasyon Rapor Durumu</h1>
        <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          Yenile
        </Button>
      </div>

      {organizations.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <p>Yönetici olduğunuz bir organizasyon bulunmamaktadır.</p>
            <Button
              className="mt-4"
              onClick={() => router.push("/organizations")}
            >
              Organizasyon Oluştur
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Organizasyon
                  </label>
                  <Select
                    value={selectedOrg}
                    onValueChange={handleSelectOrganization}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Organizasyon seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Hafta
                  </label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectWeek("prev")}
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
                      Önceki Hafta
                    </Button>
                    <div className="flex-1 text-center flex items-center justify-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{formatWeekInfo(currentWeekDate)}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectWeek("next")}
                    >
                      Sonraki Hafta
                      <ChevronRightIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Organizasyon Özeti */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Toplam Üye
                </CardTitle>
                <div className="text-2xl font-bold">{stats.totalMembers}</div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <UsersIcon className="h-4 w-4 mr-1" />
                  <span>Aktif üye sayısı</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Bu Hafta Gönderilen
                </CardTitle>
                <div className="text-2xl font-bold">
                  {stats.submittedThisWeek}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <CheckIcon className="h-4 w-4 mr-1" />
                  <span>Rapor gönderen üye sayısı</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Bu Hafta Bekleyen
                </CardTitle>
                <div className="text-2xl font-bold">
                  {stats.pendingThisWeek}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <AlertTriangleIcon className="h-4 w-4 mr-1" />
                  <span>Rapor göndermeyen üye sayısı</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Tamamlanma Oranı
                </CardTitle>
                <div className="text-2xl font-bold">
                  %{Math.round(stats.completionRate)}
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={stats.completionRate} className="h-2" />
                <div className="mt-2 text-xs text-muted-foreground">
                  {stats.submittedThisWeek} / {stats.totalMembers} üye rapor
                  gönderdi
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="list">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">Liste Görünümü</TabsTrigger>
              <TabsTrigger value="grid">Kart Görünümü</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Takım Üyeleri</CardTitle>
                  <CardDescription>
                    {selectedOrgData?.name} organizasyonundaki üyelerin haftalık
                    rapor durumları
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {members.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      Bu organizasyonda henüz üye bulunmuyor.
                    </div>
                  ) : (
                    <div className="divide-y">
                      {members.map((member) => {
                        const { status, report } = getMemberReportStatus(
                          member.id,
                          currentWeekDate
                        );

                        return (
                          <div
                            key={member.id}
                            className="py-4 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                {member.name?.charAt(0).toUpperCase() || "U"}
                              </div>
                              <div>
                                <p className="font-medium">{member.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {member.email}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(status)}
                                {getStatusBadge(status)}
                              </div>
                              {report && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewReport(report.id)}
                                >
                                  <FileTextIcon className="h-4 w-4 mr-2" />
                                  Raporu Görüntüle
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t pt-4 flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    Toplam {members.length} üye
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">
                      {stats.submittedThisWeek}
                    </span>{" "}
                    üye rapor gönderdi,
                    <span className="font-medium">
                      {" "}
                      {stats.pendingThisWeek}
                    </span>{" "}
                    üye rapor göndermedi
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="grid" className="mt-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {members.length === 0 ? (
                  <Card className="col-span-full">
                    <CardContent className="pt-6 text-center text-muted-foreground">
                      Bu organizasyonda henüz üye bulunmuyor.
                    </CardContent>
                  </Card>
                ) : (
                  members.map((member) => {
                    const { status, report } = getMemberReportStatus(
                      member.id,
                      currentWeekDate
                    );

                    return (
                      <Card key={member.id} className="overflow-hidden">
                        <div
                          className={`h-2 ${
                            status === "APPROVED"
                              ? "bg-green-500"
                              : status === "REJECTED"
                              ? "bg-red-500"
                              : status === "SUBMITTED" ||
                                status === "UNREAD" ||
                                status === "READ"
                              ? "bg-blue-500"
                              : "bg-gray-300"
                          }`}
                        ></div>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                {member.name?.charAt(0).toUpperCase() || "U"}
                              </div>
                              <div>
                                <CardTitle className="text-base">
                                  {member.name}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                  {member.email}
                                </p>
                              </div>
                            </div>
                            {getStatusBadge(status)}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-muted-foreground mb-2">
                            <div className="flex items-center gap-2 mb-2">
                              <CalendarIcon className="h-4 w-4" />
                              <span>{formatWeekInfo(currentWeekDate)}</span>
                            </div>
                            {status === "NOT_SUBMITTED" ? (
                              <p>Bu hafta için henüz rapor gönderilmemiş.</p>
                            ) : report?.createdAt ? (
                              <p>
                                Rapor{" "}
                                {format(
                                  report.createdAt.toDate(),
                                  "d MMMM yyyy HH:mm",
                                  { locale: tr }
                                )}{" "}
                                tarihinde gönderilmiş.
                              </p>
                            ) : (
                              <p>Rapor tarihi bilinmiyor.</p>
                            )}
                          </div>
                        </CardContent>
                        {report && (
                          <CardFooter className="border-t pt-4">
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => handleViewReport(report.id)}
                            >
                              <FileTextIcon className="h-4 w-4 mr-2" />
                              Raporu Görüntüle
                            </Button>
                          </CardFooter>
                        )}
                      </Card>
                    );
                  })
                )}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
