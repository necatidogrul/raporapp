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
import { FileTextIcon, CheckIcon, XIcon, BuildingIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { getManagerReports } from "@/lib/firebase-utils";
import type { Report as FirebaseReport } from "@/lib/firebase-utils";
import { auth } from "@/lib/firebase";
import type { Report } from "@/types/report";
import { Loader } from "@/components/ui/loader";

export default function ManagerReportsPage() {
  const reports = useReportStore((state) => state.reports);
  const setReports = useReportStore((state) => state.setReports);
  const reviewReport = useReportStore((state) => state.reviewReport);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [managerComment, setManagerComment] = useState("");

  // Firebase'den yönetici raporlarını yükle
  useEffect(() => {
    const loadManagerReports = async () => {
      try {
        if (!auth.currentUser) {
          setLoading(false);
          return;
        }

        setLoading(true);

        // Yönetici raporlarını getir
        const reportList = await getManagerReports(auth.currentUser.uid);


        // Firebase'den alınan verileri uygun formata dönüştür
        const formattedReports = reportList.map((doc: FirebaseReport) => {
          return {
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
          } as Report;
        });

        // Raporları store'a kaydet
        setReports(formattedReports);
      } catch (error) {
        console.error("Yönetici raporları yüklenirken hata:", error);
        toast.error("Raporlar yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    loadManagerReports();
  }, [setReports]);

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

  // Sadece gönderilmiş raporları göster
  const submittedReports = reports.filter(
    (report) => report.status === "SUBMITTED"
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Gönderilen Raporlar</h1>

      {loading ? (
        <Loader />
      ) : submittedReports.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            Henüz gönderilmiş rapor bulunmamaktadır.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {submittedReports.map((report) => (
            <Card key={report.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{report.title}</CardTitle>
                    <CardDescription>
                      {report.userName} -{" "}
                      {format(new Date(report.startDate), "d MMMM", {
                        locale: tr,
                      })}{" "}
                      -{" "}
                      {format(new Date(report.endDate), "d MMMM yyyy", {
                        locale: tr,
                      })}
                    </CardDescription>
                  </div>
                  {getStatusBadge(report.status)}
                </div>
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
                  <div className="flex items-center text-muted-foreground">
                    <BuildingIcon className="h-3 w-3 mr-1" />
                    {report.organizationName}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewReport(report.id)}
                >
                  <FileTextIcon className="h-4 w-4 mr-1" />
                  Görüntüle
                </Button>
                <Button size="sm" onClick={() => handleReviewReport(report.id)}>
                  İncele
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

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
