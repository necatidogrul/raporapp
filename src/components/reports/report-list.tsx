"use client";

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
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { SendIcon, EditIcon, EyeIcon, BuildingIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ReportDialog } from "./report-dialog";
import { toast } from "sonner";

export function ReportList() {
  const reports = useReportStore((state) => state.reports);
  const submitReport = useReportStore((state) => state.submitReport);
  const router = useRouter();
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);

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

  const handleViewReport = (reportId: string) => {
    router.push(`/reports/${reportId}`);
  };

  const handleEditReport = (reportId: string) => {
    setSelectedReport(reportId);
    setShowReportDialog(true);
  };

  const handleSubmitReport = async (reportId: string) => {
    try {
      await submitReport(reportId);
      toast.success("Rapor yöneticiye gönderildi");
    } catch (error) {
      console.error("Rapor gönderilirken hata:", error);
      toast.error(
        "Rapor gönderilirken bir hata oluştu. Lütfen tekrar deneyin."
      );
    }
  };

  return (
    <div className="space-y-4">
      {reports.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            Henüz rapor oluşturmadınız. Yeni bir rapor oluşturmak için
            &quot;Yeni Rapor&quot; butonuna tıklayın.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <Card key={report.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{report.title}</CardTitle>
                  {getStatusBadge(report.status)}
                </div>
                <CardDescription>
                  {format(new Date(report.startDate), "d MMMM", { locale: tr })}{" "}
                  -{" "}
                  {format(new Date(report.endDate), "d MMMM yyyy", {
                    locale: tr,
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-2">
                  {report.description.length > 100
                    ? `${report.description.substring(0, 100)}...`
                    : report.description}
                </div>
                <div className="flex justify-between text-sm">
                  <span>
                    <span className="font-medium">{report.tasks.length}</span>{" "}
                    görev
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center text-muted-foreground">
                      <BuildingIcon className="h-3 w-3 mr-1" />
                      {report.organizationName}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <SendIcon className="h-3 w-3 mr-1" />
                      {report.managerName || "Yönetici"}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewReport(report.id)}
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    Görüntüle
                  </Button>
                  {report.status === "DRAFT" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditReport(report.id)}
                    >
                      <EditIcon className="h-4 w-4 mr-1" />
                      Düzenle
                    </Button>
                  )}
                </div>
                {report.status === "DRAFT" && (
                  <Button
                    size="sm"
                    onClick={() => handleSubmitReport(report.id)}
                  >
                    <SendIcon className="h-4 w-4 mr-1" />
                    Gönder
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {selectedReport && (
        <ReportDialog
          reportId={selectedReport}
          open={showReportDialog}
          onOpenChange={setShowReportDialog}
        />
      )}
    </div>
  );
}
