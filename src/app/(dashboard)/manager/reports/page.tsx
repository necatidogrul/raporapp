"use client";

import { useState, useEffect } from "react";
import { useReportStore } from "@/store/report-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import {
  FileTextIcon,
  CheckIcon,
  XIcon,
  Building2,
  User,
  ListChecks,
  ChevronDown,
  BarChart3,
  Clock,
  Filter,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { getManagerReports, getUserOrganizations } from "@/lib/firebase-utils";
import type { Report as FirebaseReport } from "@/lib/firebase-utils";
import { auth } from "@/lib/firebase";
import { Loader } from "@/components/ui/loader";
import { motion } from "framer-motion";

interface Organization {
  id: string;
  name: string;
  managerId: string;
}

export default function ManagerReportsPage() {
  const reports = useReportStore((state) => state.reports);
  const setReports = useReportStore((state) => state.setReports);
  const reviewReport = useReportStore((state) => state.reviewReport);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const [isManager, setIsManager] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [managerComment, setManagerComment] = useState("");

  // Yönetici yetkisi kontrolü
  useEffect(() => {
    const checkManagerStatus = async () => {
      if (!auth.currentUser) {
        router.push("/");
        return;
      }

      try {
        const userOrgs = await getUserOrganizations(auth.currentUser.uid);
        const managerOrgs = userOrgs.filter(
          (org) => org.managerId === auth.currentUser?.uid
        );

        if (managerOrgs.length === 0) {
          toast.error("Bu sayfaya erişim yetkiniz bulunmamaktadır");
          router.push("/dashboard");
          return;
        }

        setOrganizations(managerOrgs);
        setSelectedOrg(managerOrgs[0]?.id || "");
        setIsManager(true);
      } catch (error) {
        console.error("Yetki kontrolü sırasında hata:", error);
        router.push("/dashboard");
      }
    };

    checkManagerStatus();
  }, [router]);

  // Seçili organizasyonun raporlarını yükle
  useEffect(() => {
    const loadManagerReports = async () => {
      if (!selectedOrg || !isManager || !auth.currentUser) return;

      try {
        setLoading(true);
        // Seçili organizasyonun raporlarını getir
        const reportList = await getManagerReports(
          auth.currentUser.uid,
          selectedOrg
        );

        const formattedReports = reportList.map((doc: FirebaseReport) => ({
          id: doc.id,
          firebaseId: doc.id,
          userId: doc.userId,
          userName: doc.userName,
          managerId: doc.managerId,
          managerName: doc.managerName || "",
          organizationId: doc.organizationId,
          organizationName: doc.organizationName || "",
          title: doc.title || "",
          description: doc.description || doc.content || "",
          startDate: doc.reportPeriod?.startDate?.toDate() || new Date(),
          endDate: doc.reportPeriod?.endDate?.toDate() || new Date(),
          status:
            doc.status === "UNREAD" || doc.status === "READ"
              ? "SUBMITTED"
              : (doc.status as
                  | "DRAFT"
                  | "SUBMITTED"
                  | "APPROVED"
                  | "REJECTED") || "DRAFT",
          tasks: doc.tasks || [],
          createdAt: doc.createdAt?.toDate() || new Date(),
          updatedAt: doc.updatedAt?.toDate() || new Date(),
          submittedAt: doc.submittedAt?.toDate(),
          reviewedAt: doc.reviewedAt?.toDate(),
          managerComment: doc.managerComment || "",
        }));

        setReports(formattedReports);
      } catch (error) {
        console.error("Raporlar yüklenirken hata:", error);
        toast.error("Raporlar yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    // Raporları yükle
    loadManagerReports();

    // Seçili organizasyon değiştiğinde raporları temizle
    return () => {
      setReports([]);
    };
  }, [selectedOrg, isManager, setReports]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <Badge variant="outline">Taslak</Badge>;
      case "SUBMITTED":
        return <Badge variant="secondary">Gönderildi</Badge>;
      case "APPROVED":
        return <Badge variant="success">Onaylandı</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Reddedildi</Badge>;
      default:
        return <Badge variant="outline">Taslak</Badge>;
    }
  };

  const filteredReports = reports.filter((report) => {
    if (statusFilter === "all") return true;
    return report.status === statusFilter;
  });

  const stats = {
    total: reports.length,
    submitted: reports.filter((r) => r.status === "SUBMITTED").length,
    approved: reports.filter((r) => r.status === "APPROVED").length,
    rejected: reports.filter((r) => r.status === "REJECTED").length,
  };

  const handleViewReport = (reportId: string) => {
    router.push(`/manager/reports/${reportId}`);
  };

  const handleReviewReport = (reportId: string) => {
    setSelectedReport(reportId);
    setShowReviewDialog(true);
  };

  const handleApproveReport = () => {
    if (selectedReport) {
      reviewReport(selectedReport, "APPROVED", managerComment);
      setShowReviewDialog(false);
      setManagerComment("");
      toast.success("Rapor onaylandı");
    }
  };

  const handleRejectReport = () => {
    if (selectedReport) {
      reviewReport(selectedReport, "REJECTED", managerComment);
      setShowReviewDialog(false);
      setManagerComment("");
      toast.error("Rapor reddedildi");
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col gap-2">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-500 to-blue-500 text-transparent bg-clip-text"
        >
          Gönderilen Raporlar
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground"
        >
          Ekibinizin gönderdiği raporları inceleyebilir ve
          değerlendirebilirsiniz.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Toplam Rapor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-2xl font-bold">{stats.submitted}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Onaylanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold">{stats.approved}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-rose-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Reddedilen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <XIcon className="h-4 w-4 text-red-500" />
              <span className="text-2xl font-bold">{stats.rejected}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
      >
        <Select value={selectedOrg} onValueChange={setSelectedOrg}>
          <SelectTrigger className="w-full sm:w-[240px]">
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="h-4 w-4 mr-2" />
                Filtrele
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                Tümü
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("SUBMITTED")}>
                Bekleyenler
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("APPROVED")}>
                Onaylananlar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("REJECTED")}>
                Reddedilenler
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader className="w-8 h-8 text-primary" />
        </div>
      ) : filteredReports.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border-dashed">
            <CardContent className="py-8 text-center space-y-3">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                  <FileTextIcon className="w-12 h-12 text-primary relative" />
                </div>
              </div>
              <p className="text-lg font-medium">
                {selectedOrg
                  ? "Bu organizasyonda henüz rapor bulunmamaktadır"
                  : "Lütfen bir organizasyon seçin"}
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedOrg
                  ? "Ekibiniz rapor gönderdiğinde burada listelenecektir"
                  : "Raporları görüntülemek için organizasyon seçmelisiniz"}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid gap-4"
        >
          {filteredReports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden group hover:shadow-lg hover:border-primary/50 transition-all duration-300">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {report.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {report.userName}
                        </span>
                        <span className="text-muted-foreground/50">•</span>
                        <span>
                          {format(new Date(report.startDate), "d MMMM", {
                            locale: tr,
                          })}{" "}
                          -{" "}
                          {format(new Date(report.endDate), "d MMMM yyyy", {
                            locale: tr,
                          })}
                        </span>
                      </CardDescription>
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }}>
                      {getStatusBadge(report.status)}
                    </motion.div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {report.description}
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <ListChecks className="h-4 w-4 text-primary" />
                        <span className="font-medium">
                          {report.tasks.length}
                        </span>{" "}
                        görev
                      </span>
                      <span className="flex items-center gap-1">
                        <Building2 className="h-4 w-4 text-primary" />
                        {report.organizationName}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(report.createdAt), "d MMM yyyy HH:mm", {
                        locale: tr,
                      })}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewReport(report.id)}
                    className="w-full group/button hover:border-primary/50"
                  >
                    <FileTextIcon className="h-4 w-4 mr-2 group-hover/button:text-primary transition-colors" />
                    Görüntüle
                  </Button>
                  {report.status === "SUBMITTED" && (
                    <Button
                      size="sm"
                      onClick={() => handleReviewReport(report.id)}
                      className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                    >
                      <CheckIcon className="h-4 w-4 mr-2" />
                      İncele
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-purple-600 text-transparent bg-clip-text">
              Raporu İncele
            </DialogTitle>
            <DialogDescription>
              Raporu onaylayabilir veya reddedebilirsiniz. İsterseniz bir yorum
              ekleyebilirsiniz.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="comment" className="text-sm font-medium">
                Yorum
              </label>
              <Textarea
                id="comment"
                value={managerComment}
                onChange={(e) => setManagerComment(e.target.value)}
                placeholder="Rapor hakkında yorumunuzu yazın..."
                rows={4}
                className="resize-none focus:ring-primary"
              />
            </div>
          </div>

          <DialogFooter className="flex justify-between gap-2 sm:justify-end">
            <Button
              variant="destructive"
              onClick={handleRejectReport}
              className="w-full sm:w-auto gap-2 hover:bg-red-600/90"
            >
              <XIcon className="h-4 w-4" />
              Reddet
            </Button>
            <Button
              onClick={handleApproveReport}
              className="w-full sm:w-auto gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
            >
              <CheckIcon className="h-4 w-4" />
              Onayla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
