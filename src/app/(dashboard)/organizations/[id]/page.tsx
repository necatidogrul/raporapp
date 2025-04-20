"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import {
  getOrganization,
  getOrganizationMembers,
  getManagerReports,
  sendInvitation,
  getOrganizationInvitations,
  Organization,
  UserData,
  Report,
  Invitation,
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
import { Badge } from "@/components/ui/badge";
import {
  FileTextIcon,
  CheckIcon,
  XIcon,
  AlertTriangleIcon,
  CalendarIcon,
  RefreshCw,
  UsersIcon,
  ArrowLeftIcon,
  BuildingIcon,
  Users,
  ClipboardListIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  format,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  subWeeks,
  addWeeks,
} from "date-fns";
import { tr } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Report tipini genişlet
interface ExtendedReport extends Omit<Report, "tasks"> {
  tasks?: Array<{
    id?: string;
    title: string;
    completed: boolean;
    endDate?: string;
  }>;
}

// Raporu ExtendedReport'a dönüştüren yardımcı fonksiyon
const convertToExtendedReport = (report: Report): ExtendedReport => ({
  ...report,
  tasks: report.tasks?.map((task) => ({
    id: task.id,
    title: task.title,
    completed: task.status === "COMPLETED",
    endDate: task.endDate?.toISOString(),
  })),
});

export default function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<UserData[]>([]);
  const [reports, setReports] = useState<ExtendedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentWeekDate, setCurrentWeekDate] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalReports: 0,
    submittedThisWeek: 0,
    pendingThisWeek: 0,
    completionRate: 0,
  });
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  // İstatistikleri hesapla
  const calculateStats = useCallback(
    (members: UserData[], reports: ExtendedReport[]) => {
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
      const pendingThisWeek =
        totalMembers > 0 ? totalMembers - submittedThisWeek : 0;
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

  // Organizasyon ve verileri yükle
  useEffect(() => {
    const loadOrganizationData = async () => {
      try {
        if (!params.id || typeof params.id !== "string") {
          setError("Organizasyon ID'si bulunamadı");
          setLoading(false);
          return;
        }

        // Auth durumunu kontrol et
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
          if (!user) {
            router.push("/login");
            return;
          }

          try {
            // Organizasyon bilgilerini getir
            const orgData = await getOrganization(params.id as string);
            if (!orgData) {
              setError("Organizasyon bulunamadı");
              setLoading(false);
              return;
            }

            setOrganization(orgData);

            // Üyeleri getir
            const memberList = await getOrganizationMembers(
              params.id as string
            );
            setMembers(memberList);

            // Raporları getir (sadece yönetici ise)
            if (user.uid === orgData.managerId) {
              const reportList = await getManagerReports(user.uid);
              // Sadece bu organizasyona ait raporları filtrele
              const orgReports = reportList
                .filter((report) => report.organizationId === params.id)
                .map(convertToExtendedReport);

              setReports(orgReports);
              calculateStats(memberList, orgReports);

              // Davetiyeleri getir
              const invitationList = await getOrganizationInvitations(
                params.id as string
              );
              setInvitations(invitationList);
            } else {
              // Yönetici değilse boş rapor listesi ve istatistikler
              setReports([]);
              calculateStats(memberList, []);
            }
          } catch (error) {
            console.error("Organizasyon verileri yüklenirken hata:", error);
            setError("Organizasyon verileri yüklenirken bir hata oluştu");
          } finally {
            setLoading(false);
          }
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Organizasyon verileri yüklenirken hata:", error);
        setError("Organizasyon verileri yüklenirken bir hata oluştu");
        setLoading(false);
      }
    };

    loadOrganizationData();
  }, [params.id, router, calculateStats]);

  const handleRefresh = async () => {
    if (!organization || !auth.currentUser) return;

    setRefreshing(true);
    try {
      // Üyeleri yükle
      const memberList = await getOrganizationMembers(organization.id);
      setMembers(memberList);

      // Raporları yükle
      const reportList = await getManagerReports(auth.currentUser.uid);
      // Sadece bu organizasyona ait raporları filtrele ve dönüştür
      const orgReports = reportList
        .filter((report) => report.organizationId === organization.id)
        .map(convertToExtendedReport);

      setReports(orgReports);
      calculateStats(memberList, orgReports);

      toast.success("Veriler yenilendi");
    } catch (error) {
      console.error("Veriler yenilenirken hata:", error);
      toast.error("Veriler yenilenirken bir hata oluştu");
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewReport = (reportId: string) => {
    // Rapor detaylarını al
    const reportToView = reports.find((r) => r.id === reportId);

    if (!reportToView) {
      toast.error("Rapor bulunamadı");
      return;
    }

    // Raporu Firebase'den getirmek için doğrudan ID ile yönlendir
    // Zustand store kullanmak yerine doğrudan Firebase'den veri çekecek şekilde ayarla
    router.push(`/manager/reports/${reportId}?direct=true`);
  };

  const handleSelectWeek = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setCurrentWeekDate((prevDate) => {
        // Önceki haftaya git
        return subWeeks(prevDate, 1);
      });
    } else {
      // Sonraki haftaya git
      setCurrentWeekDate((prevDate) => {
        return addWeeks(prevDate, 1);
      });
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

  const handleInvite = async () => {
    try {
      if (!organization || !auth.currentUser) {
        toast.error("Bu işlem için giriş yapmanız gerekiyor");
        return;
      }

      if (!inviteEmail.trim()) {
        toast.error("Lütfen bir e-posta adresi girin");
        return;
      }

      // E-posta formatı kontrolü
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(inviteEmail)) {
        toast.error("Geçerli bir e-posta adresi girin");
        return;
      }

      // Yönetici kontrolü
      if (organization.managerId !== auth.currentUser.uid) {
        toast.error("Bu işlem için yönetici olmanız gerekiyor");
        return;
      }

      setIsInviting(true);

      await sendInvitation({
        organizationId: organization.id,
        organizationName: organization.name,
        managerId: auth.currentUser.uid,
        managerName: auth.currentUser.displayName || "İsimsiz Yönetici",
        recipientEmail: inviteEmail.trim(),
      });

      // Davetiye gönderildikten sonra davetleri yeniden yükle
      const invitationList = await getOrganizationInvitations(organization.id);
      setInvitations(invitationList);

      setInviteEmail("");
      setShowInviteDialog(false);
      toast.success("Davetiye başarıyla gönderildi");
    } catch (error: unknown) {
      console.error("Davet gönderilirken hata:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Davet gönderilirken bir hata oluştu";
      toast.error(errorMessage);
    } finally {
      setIsInviting(false);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-4">
          <Button variant="ghost" onClick={() => router.push("/organizations")}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Organizasyonlara Dön
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6 text-center text-red-500">
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return <div className="p-6">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.push("/organizations")}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Geri
          </Button>
          <div className="ml-4">
            <h1 className="text-2xl font-bold">{organization?.name}</h1>
            <p className="text-muted-foreground">{organization?.description}</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          Yenile
        </Button>
      </div>

      {/* Hafta Seçimi - Sadece yöneticiler için */}
      {auth.currentUser?.uid === organization?.managerId && (
        <>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 mr-4">
                  <BuildingIcon className="h-5 w-5 text-primary" />
                  <span className="font-medium">Haftalık Rapor Durumu</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectWeek("prev")}
                >
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
                </Button>
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
        </>
      )}

      <Tabs defaultValue="members">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="members">Üyeler</TabsTrigger>
          {auth.currentUser?.uid === organization?.managerId && (
            <TabsTrigger value="reports">Raporlar</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="members" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Takım Üyeleri</CardTitle>
                <CardDescription>
                  {organization?.name} organizasyonundaki üyeler
                </CardDescription>
              </div>
              {auth.currentUser?.uid === organization?.managerId && (
                <Button
                  onClick={() => setShowInviteDialog(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Üye Davet Et
                </Button>
              )}
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
                        {auth.currentUser?.uid === organization?.managerId && (
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
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {auth.currentUser?.uid === organization?.managerId &&
                invitations.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4">
                      Bekleyen Davetiyeler
                    </h3>
                    <div className="divide-y">
                      {invitations
                        .filter((inv) => inv.status === "PENDING")
                        .map((invitation) => (
                          <div
                            key={invitation.id}
                            className="py-3 flex items-center justify-between"
                          >
                            <div>
                              <p className="font-medium">
                                {invitation.userEmail}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(
                                  invitation.createdAt.toDate(),
                                  "dd MMM yyyy HH:mm",
                                  { locale: tr }
                                )}
                              </p>
                            </div>
                            <Badge variant="outline">Bekliyor</Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        {auth.currentUser?.uid === organization?.managerId && (
          <TabsContent value="reports" className="mt-4">
            <Card>
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardListIcon className="h-5 w-5 text-primary" />
                      Haftalık Raporlar
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {formatWeekInfo(currentWeekDate)} haftası için gönderilen
                      raporlar
                    </CardDescription>
                  </div>
                  <div className="text-sm bg-primary/10 text-primary font-medium px-3 py-1 rounded-md">
                    {stats.submittedThisWeek} / {stats.totalMembers} Rapor
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {reports.length === 0 ? (
                  <div className="text-center py-12 flex flex-col items-center justify-center space-y-3">
                    <FileTextIcon className="h-12 w-12 text-muted-foreground/50" />
                    <p className="text-muted-foreground">
                      Bu hafta için henüz rapor bulunmuyor.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {reports
                      .filter((report) => {
                        if (!report.createdAt) return false;

                        const weekStart = startOfWeek(currentWeekDate, {
                          weekStartsOn: 1,
                        });
                        const weekEnd = endOfWeek(currentWeekDate, {
                          weekStartsOn: 1,
                        });

                        const reportDate = report.createdAt.toDate();
                        return isWithinInterval(reportDate, {
                          start: weekStart,
                          end: weekEnd,
                        });
                      })
                      .map((report) => (
                        <Card
                          key={report.id}
                          className="overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div
                            className={`h-2 ${
                              report.status === "APPROVED"
                                ? "bg-green-500"
                                : report.status === "REJECTED"
                                ? "bg-red-500"
                                : report.status === "SUBMITTED" ||
                                  report.status === "UNREAD" ||
                                  report.status === "READ"
                                ? "bg-blue-500"
                                : "bg-gray-300"
                            }`}
                          ></div>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                  {report.userName?.charAt(0).toUpperCase() ||
                                    "U"}
                                </div>
                                <div>
                                  <CardTitle className="text-base">
                                    {report.userName}
                                  </CardTitle>
                                  <p className="text-sm text-muted-foreground">
                                    {report.createdAt &&
                                      format(
                                        report.createdAt.toDate(),
                                        "d MMMM yyyy HH:mm",
                                        { locale: tr }
                                      )}
                                  </p>
                                </div>
                              </div>
                              {getStatusBadge(report.status)}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="mt-2">
                              <h3 className="font-medium text-sm mb-1">
                                Rapor İçeriği
                              </h3>
                              <div className="text-sm bg-muted/30 p-3 rounded-md border">
                                {report.content || report.description ? (
                                  <p className="whitespace-pre-line">
                                    {(
                                      report.content ||
                                      report.description ||
                                      ""
                                    ).substring(0, 150)}
                                    {(
                                      report.content ||
                                      report.description ||
                                      ""
                                    ).length > 150
                                      ? "..."
                                      : ""}
                                  </p>
                                ) : (
                                  <p className="text-muted-foreground italic">
                                    İçerik yok
                                  </p>
                                )}
                              </div>
                              {report.tasks && report.tasks.length > 0 && (
                                <div className="mt-3">
                                  <h3 className="font-medium text-sm mb-1 flex items-center gap-2">
                                    <ClipboardListIcon className="h-4 w-4 text-primary" />
                                    Görevler ({report.tasks.length})
                                  </h3>
                                  <div className="bg-muted/30 p-3 rounded-md border">
                                    <div className="space-y-2">
                                      {report.tasks
                                        .slice(0, 2)
                                        .map((task, index) => (
                                          <div
                                            key={task.id || index}
                                            className="text-xs flex items-start gap-2"
                                          >
                                            <div
                                              className={`min-w-5 h-5 rounded-full flex items-center justify-center text-white ${
                                                task.completed
                                                  ? "bg-green-500"
                                                  : "bg-blue-500"
                                              }`}
                                            >
                                              {task.completed ? (
                                                <CheckIcon className="h-3 w-3" />
                                              ) : (
                                                <span className="text-[10px] font-medium">
                                                  !
                                                </span>
                                              )}
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                              <p className="font-medium truncate">
                                                {task.title}
                                              </p>
                                              {task.endDate && (
                                                <span className="text-muted-foreground text-[10px]">
                                                  Son Tarih:{" "}
                                                  {format(
                                                    new Date(task.endDate),
                                                    "d MMM yyyy",
                                                    { locale: tr }
                                                  )}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        ))}

                                      {report.tasks.length > 2 && (
                                        <div className="text-xs text-center mt-1 text-muted-foreground">
                                          +{report.tasks.length - 2} görev daha
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                          <CardFooter className="border-t pt-4 flex justify-between">
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => handleViewReport(report.id)}
                            >
                              <FileTextIcon className="h-4 w-4 mr-2" />
                              Raporu Görüntüle
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Davet Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Üye Davet Et</DialogTitle>
            <DialogDescription>
              Organizasyonunuza yeni bir üye davet edin. Davet gönderebilmek
              için kullanıcının sistemde kayıtlı olması gerekir.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="inviteEmail">E-posta Adresi</Label>
              <Input
                id="inviteEmail"
                placeholder="ornek@mail.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowInviteDialog(false)}
            >
              İptal
            </Button>
            <Button
              onClick={handleInvite}
              disabled={isInviting}
              className="bg-primary hover:bg-primary/90"
            >
              {isInviting ? "Gönderiliyor..." : "Davet Gönder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
