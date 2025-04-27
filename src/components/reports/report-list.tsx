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
import {
  SendIcon,
  EditIcon,
  EyeIcon,
  BuildingIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircle2Icon,
  XCircleIcon,
  FileEditIcon,
  FileIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ReportDialog } from "./report-dialog";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export function ReportList() {
  const reports = useReportStore((state) => state.reports);
  const submitReport = useReportStore((state) => state.submitReport);
  const router = useRouter();
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return (
          <Badge
            variant="outline"
            className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 font-medium"
          >
            <FileEditIcon className="w-3 h-3 mr-1" />
            Taslak
          </Badge>
        );
      case "SUBMITTED":
        return (
          <Badge
            variant="secondary"
            className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 font-medium"
          >
            <SendIcon className="w-3 h-3 mr-1" />
            Gönderildi
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge
            variant="success"
            className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 font-medium"
          >
            <CheckCircle2Icon className="w-3 h-3 mr-1" />
            Onaylandı
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge
            variant="destructive"
            className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 font-medium"
          >
            <XCircleIcon className="w-3 h-3 mr-1" />
            Reddedildi
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 font-medium"
          >
            <FileIcon className="w-3 h-3 mr-1" />
            Taslak
          </Badge>
        );
    }
  };

  const getStatusBorderColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "border-l-slate-500 hover:border-l-slate-600";
      case "SUBMITTED":
        return "border-l-blue-500 hover:border-l-blue-600";
      case "APPROVED":
        return "border-l-green-500 hover:border-l-green-600";
      case "REJECTED":
        return "border-l-red-500 hover:border-l-red-600";
      default:
        return "border-l-slate-500 hover:border-l-slate-600";
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
      <AnimatePresence>
        {reports.length === 0 ? (
          <motion.div {...fadeInUp}>
            <Card className="border border-dashed">
              <CardContent className="pt-6 pb-8 text-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <FileIcon className="h-8 w-8 text-muted-foreground/50" />
                  <p>Henüz rapor oluşturmadınız.</p>
                  <p className="text-sm">
                    Yeni bir rapor oluşturmak için &quot;Yeni Rapor&quot; butonuna tıklayın.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report, index) => (
              <motion.div
                key={report.id}
                {...fadeInUp}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                <Card
                  className={`overflow-hidden border-l-4 ${getStatusBorderColor(
                    report.status
                  )} transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-l-[6px] bg-card/50 backdrop-blur-sm`}
                >
                  <CardHeader className="pb-2 bg-muted/30">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-lg font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        {report.title}
                      </CardTitle>
                      {getStatusBadge(report.status)}
                    </div>
                    <CardDescription className="flex items-center mt-2 text-muted-foreground/80">
                      <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
                      {format(new Date(report.startDate), "d MMMM", { locale: tr })}{" "}
                      -{" "}
                      {format(new Date(report.endDate), "d MMMM yyyy", {
                        locale: tr,
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="text-sm text-muted-foreground/90 mb-4 line-clamp-2">
                      {report.description || "Açıklama eklenmemiş"}
                    </div>
                    <div className="flex flex-col gap-2.5">
                      <div className="flex justify-between items-center text-sm">
                        <span className="flex items-center text-primary/90">
                          <ClockIcon className="h-3.5 w-3.5 mr-1.5" />
                          <span className="font-medium">
                            {format(new Date(report.createdAt), "dd.MM.yyyy", {
                              locale: tr,
                            })}
                          </span>{" "}
                          tarihinde oluşturuldu
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center text-blue-500/90">
                          <SendIcon className="h-3.5 w-3.5 mr-1.5" />
                          <span className="font-medium">
                            {report.tasks.length}
                          </span>{" "}
                          görev
                        </span>
                        <div className="flex items-center text-muted-foreground/80">
                          <BuildingIcon className="h-3.5 w-3.5 mr-1.5" />
                          {report.organizationName || "Organizasyon"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-4 pb-4 border-t bg-muted/20">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewReport(report.id)}
                        className="rounded-full hover:bg-background/80 hover:text-primary transition-colors"
                      >
                        <EyeIcon className="h-4 w-4 mr-1.5" />
                        Görüntüle
                      </Button>
                      {report.status === "DRAFT" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditReport(report.id)}
                          className="rounded-full hover:bg-background/80 hover:text-primary transition-colors"
                        >
                          <EditIcon className="h-4 w-4 mr-1.5" />
                          Düzenle
                        </Button>
                      )}
                    </div>
                    {report.status === "DRAFT" && (
                      <Button
                        size="sm"
                        onClick={() => handleSubmitReport(report.id)}
                        className="rounded-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <SendIcon className="h-4 w-4 mr-1.5" />
                        Gönder
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

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
