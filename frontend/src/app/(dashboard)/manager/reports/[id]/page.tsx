"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useReportStore } from "@/store/report-store";
import { Report } from "@/types/report";
import { Button } from "@/components/ui/button";
import {} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

import { ArrowLeftIcon, CheckIcon, XIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ReportFormatter } from "@/components/reports/report-formatter";

export default function ManagerReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDirect = searchParams.get("direct") === "true";
  const reports = useReportStore((state) => state.reports);
  const reviewReport = useReportStore((state) => state.reviewReport);

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [managerComment, setManagerComment] = useState("");

  // Firebase'den doğrudan rapor verilerini al
  const fetchReportFromFirebase = useCallback(
    async (reportId: string) => {
      try {
        setLoading(true);
        const reportRef = doc(db, "reports", reportId);
        const reportSnap = await getDoc(reportRef);

        if (reportSnap.exists()) {
          const reportData = reportSnap.data();

          // Firebase Timestamp'lerini JavaScript Date nesnelerine dönüştür
          const processedData: Partial<Report> = {
            ...reportData,
            createdAt: reportData.createdAt?.toDate
              ? reportData.createdAt.toDate()
              : new Date(),
            updatedAt: reportData.updatedAt?.toDate
              ? reportData.updatedAt.toDate()
              : new Date(),
            submittedAt: reportData.submittedAt?.toDate
              ? reportData.submittedAt.toDate()
              : undefined,
            reviewedAt: reportData.reviewedAt?.toDate
              ? reportData.reviewedAt.toDate()
              : undefined,
          };

          // Rapor periyodu varsa onları da dönüştür
          if (reportData.reportPeriod) {
            processedData.startDate = reportData.reportPeriod.startDate?.toDate
              ? reportData.reportPeriod.startDate.toDate()
              : new Date();
            processedData.endDate = reportData.reportPeriod.endDate?.toDate
              ? reportData.reportPeriod.endDate.toDate()
              : new Date();
          }

          setReport({
            id: reportSnap.id,
            ...processedData,
          } as unknown as Report);
        } else {
          toast.error("Rapor bulunamadı");
          router.push("/manager/reports");
        }
      } catch (error) {
        console.error("Rapor yüklenirken hata:", error);
        toast.error("Rapor yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    if (params.id) {
      if (isDirect) {
        // Doğrudan Firebase'den raporu al
        fetchReportFromFirebase(params.id as string);
      } else {
        // Zustand store'dan raporu al
        const foundReport = reports.find((r) => r.id === params.id);
        if (foundReport) {
          setReport(foundReport);
          setLoading(false);
        } else {
          // Rapor bulunamadıysa Firebase'den kontrol et
          fetchReportFromFirebase(params.id as string);
        }
      }
    }
  }, [params.id, reports, router, isDirect, fetchReportFromFirebase]);

  const handleBack = () => {
    router.back();
  };

  const handleReviewReport = () => {
    setShowReviewDialog(true);
  };

  const handleApproveReport = () => {
    if (report) {
      reviewReport(report.id, "APPROVED", managerComment);
      setShowReviewDialog(false);
      setManagerComment("");
      toast.success("Rapor onaylandı");
    }
  };

  const handleRejectReport = () => {
    if (report) {
      reviewReport(report.id, "REJECTED", managerComment);
      setShowReviewDialog(false);
      setManagerComment("");
      toast.error("Rapor reddedildi");
    }
  };

  if (loading) {
    return (
      <div className="container py-12 px-4 md:px-8">
        <div className="flex flex-col items-center justify-center space-y-4 min-h-[60vh]">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Rapor yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container py-12 px-4 md:px-8">
        <div className="flex flex-col items-center justify-center space-y-4 min-h-[60vh]">
          <p className="text-muted-foreground">Rapor bulunamadı</p>
          <Button onClick={() => router.push("/manager/reports")}>
            Raporlara Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Geri
          </Button>
          <h1 className="text-2xl font-bold ml-4">Rapor Detayı</h1>
        </div>
        <div className="flex space-x-2">
          {report.status === "SUBMITTED" && (
            <Button onClick={handleReviewReport}>İncele</Button>
          )}
        </div>
      </div>

      <ReportFormatter report={report} />

      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Raporu İncele</DialogTitle>
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
              />
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button variant="destructive" onClick={handleRejectReport}>
              <XIcon className="h-4 w-4 mr-2" />
              Reddet
            </Button>
            <Button variant="default" onClick={handleApproveReport}>
              <CheckIcon className="h-4 w-4 mr-2" />
              Onayla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
