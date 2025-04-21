"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useReportStore } from "@/store/report-store";
import { Report } from "@/types/report";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, SendIcon, EditIcon } from "lucide-react";
import { ReportDialog } from "@/components/reports/report-dialog";
import { toast } from "sonner";
import { ReportFormatter } from "@/components/reports/report-formatter";

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reports = useReportStore((state) => state.reports);
  const submitReport = useReportStore((state) => state.submitReport);

  const [report, setReport] = useState<Report | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    if (params.id) {
      const foundReport = reports.find((r) => r.id === params.id);
      if (foundReport) {
        setReport(foundReport);
      } else {
        // Rapor bulunamadıysa ana sayfaya yönlendir
        router.push("/reports");
      }
    }
  }, [params.id, reports, router]);

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    setShowEditDialog(true);
  };

  const handleSubmit = async () => {
    if (report) {
      // Task kontrolü ekle
      if (report.tasks.length === 0) {
        toast.error(
          "Lütfen en az bir görev ekleyiniz. Rapor boş olarak gönderilemez."
        );
        return;
      }

      try {
        await submitReport(report.id);
        toast.success("Rapor yöneticiye gönderildi");
      } catch (error) {
        console.error("Rapor gönderilirken hata:", error);
        toast.error(
          "Rapor gönderilirken bir hata oluştu. Lütfen tekrar deneyin."
        );
      }
    }
  };

  if (!report) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Geri
          </Button>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          Rapor bulunamadı
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
          {report.status === "DRAFT" && (
            <>
              <Button variant="outline" onClick={handleEdit}>
                <EditIcon className="h-4 w-4 mr-2" />
                Düzenle
              </Button>
              <Button onClick={handleSubmit}>
                <SendIcon className="h-4 w-4 mr-2" />
                Yöneticiye Gönder
              </Button>
            </>
          )}
        </div>
      </div>

      <ReportFormatter report={report} />

      {showEditDialog && (
        <ReportDialog
          reportId={report.id}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
        />
      )}
    </div>
  );
}
