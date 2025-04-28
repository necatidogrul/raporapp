"use client";

import { useEffect, useState } from "react";
import { ReportList } from "@/components/reports/report-list";
import { Button } from "@/components/ui/button";
import {
  PlusIcon,
  UserIcon,
  ClipboardListIcon,
  ClipboardCheckIcon,
  FileTextIcon,
  SendIcon,
  ArrowUpIcon,
  TrendingUpIcon,
  CheckCircle2Icon,
  Sparkles,
} from "lucide-react";
import { NewReportDialog } from "@/components/reports/new-report-dialog";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useReportStore } from "@/store/report-store";
import { Report } from "@/types/report";
import { toast } from "sonner";
import { Loader } from "@/components/ui/loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserData } from "@/lib/firebase-utils";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const scaleIn = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.3 },
};

export default function ReportsPage() {
  const [showNewReportDialog, setShowNewReportDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("");
  const [progressValue, setProgressValue] = useState<number>(0);
  const setReports = useReportStore((state) => state.setReports);
  const reports = useReportStore((state) => state.reports);

  // Firebase'den raporları yükle
  useEffect(() => {
    const loadReports = async () => {
      try {
        if (!auth.currentUser) return;

        setLoading(true);

        // Kullanıcının raporlarını getir
        const q = query(
          collection(db, "reports"),
          where("userId", "==", auth.currentUser.uid),
          orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);

        const reports = querySnapshot.docs.map((doc) => {
          const data = doc.data();

          // Firebase verilerini uygun formata dönüştür
          return {
            id: data.id,
            firebaseId: doc.id,
            userId: data.userId,
            userName: data.userName,
            managerId: data.managerId,
            managerName: data.managerName,
            organizationId: data.organizationId,
            organizationName: data.organizationName,
            title: data.title || "",
            description: data.description || "",
            startDate: data.reportPeriod?.startDate?.toDate() || new Date(),
            endDate: data.reportPeriod?.endDate?.toDate() || new Date(),
            status:
              data.status === "UNREAD" || data.status === "READ"
                ? "SUBMITTED"
                : data.status || "DRAFT",
            tasks: data.tasks || [],
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            submittedAt: data.submittedAt?.toDate(),
            reviewedAt: data.reviewedAt?.toDate(),
            managerComment: data.managerComment,
          } as Report;
        });

        // Raporları store'a kaydet
        setReports(reports);
      } catch (error) {
        console.error("Raporlar yüklenirken hata:", error);
        toast.error("Raporlar yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, [setReports]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userData = await getUserData(auth.currentUser.uid);
        if (userData) {
          setUserName(userData.name);
        }
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    // Onaylanan raporlar oranı için progress bar
    const approvedReports = reports.filter(
      (report) => report.status === "APPROVED"
    );
    const approvalRate =
      reports.length > 0
        ? Math.round((approvedReports.length / reports.length) * 100)
        : 0;

    const timer = setTimeout(() => {
      setProgressValue(approvalRate);
    }, 300);

    return () => clearTimeout(timer);
  }, [reports]);

  // Rapor istatistikleri
  const submittedReports = reports.filter(
    (report) => report.status === "SUBMITTED"
  );
  const approvedReports = reports.filter(
    (report) => report.status === "APPROVED"
  );

  const approvalRate =
    reports.length > 0
      ? Math.round((approvedReports.length / reports.length) * 100)
      : 0;

  return (
    <div className="space-y-8 p-4 max-w-7xl mx-auto">
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-background border shadow-lg"
      >
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(56,189,248,0.1),rgba(168,85,247,0.1))]" />
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black,transparent)]" />
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-purple-600 to-blue-600 text-transparent bg-clip-text">
                Raporlarım
              </h1>
            </div>
            <p className="text-muted-foreground">
              Performansınızı izleyin ve raporlarınızı yönetin
            </p>
          </div>
          <div className="flex gap-3">
            {userName && (
              <div className="flex items-center gap-3 text-sm bg-background/80 backdrop-blur-sm py-2.5 px-5 rounded-full shadow-lg border transition-all hover:bg-background/90">
                <UserIcon className="h-5 w-5 text-primary" />
                <span className="font-medium">{userName}</span>
              </div>
            )}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => setShowNewReportDialog(true)}
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Yeni Rapor
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          {...scaleIn}
          className="transition-transform duration-200 hover:scale-[1.02]"
        >
          <Card className="overflow-hidden border-l-4 border-l-primary shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
              <CardTitle className="text-sm font-medium">
                Toplam Rapor
              </CardTitle>
              <div className="rounded-full bg-primary/10 p-2">
                <FileTextIcon className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
                {reports.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <TrendingUpIcon className="h-3 w-3 mr-1 text-primary" />
                Toplam rapor sayısı
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          {...scaleIn}
          className="transition-transform duration-200 hover:scale-[1.02]"
        >
          <Card className="overflow-hidden border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
              <CardTitle className="text-sm font-medium">Onaylanan</CardTitle>
              <div className="rounded-full bg-green-100 p-2">
                <CheckCircle2Icon className="h-5 w-5 text-green-500" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold bg-gradient-to-r from-green-500 to-green-600 text-transparent bg-clip-text">
                {approvedReports.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <ArrowUpIcon className="h-3 w-3 mr-1 text-green-500" />
                Onaylanan raporlar
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          {...scaleIn}
          className="transition-transform duration-200 hover:scale-[1.02]"
        >
          <Card className="overflow-hidden border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
              <CardTitle className="text-sm font-medium">Gönderilen</CardTitle>
              <div className="rounded-full bg-blue-100 p-2">
                <SendIcon className="h-5 w-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-transparent bg-clip-text">
                {submittedReports.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <ClipboardCheckIcon className="h-3 w-3 mr-1 text-blue-500" />
                İnceleme bekleyen
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          {...scaleIn}
          className="transition-transform duration-200 hover:scale-[1.02]"
        >
          <Card className="overflow-hidden border-l-4 border-l-amber-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
              <CardTitle className="text-sm font-medium">
                Onaylanma Oranı
              </CardTitle>
              <div className="rounded-full bg-amber-100 p-2">
                <ClipboardListIcon className="h-5 w-5 text-amber-500" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-transparent bg-clip-text">
                {approvalRate}%
              </div>
              <div className="mt-2">
                <Progress value={progressValue} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="bg-card rounded-xl border shadow-lg overflow-hidden backdrop-blur-sm"
      >
        <div className="bg-muted/30 p-6 border-b">
          <div className="flex items-center gap-2">
            <FileTextIcon className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
              Raporlarım
            </h2>
          </div>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-8 h-8 text-primary" />
            </div>
          ) : (
            <ReportList />
          )}
        </div>
      </motion.div>

      <NewReportDialog
        open={showNewReportDialog}
        onOpenChange={setShowNewReportDialog}
      />
    </div>
  );
}
