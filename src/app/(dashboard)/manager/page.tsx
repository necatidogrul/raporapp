"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import {
  getManagerReports,
  markReportAsRead,
  Report,
} from "@/lib/firebase-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Check, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Loader } from "@/components/ui/loader";

export default function ManagerPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadReports();

    // 30 saniyede bir otomatik yenileme
    const interval = setInterval(() => {
      loadReports(false);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadReports = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      if (auth.currentUser) {
        console.log(
          "Yönetici raporları yükleniyor, kullanıcı ID:",
          auth.currentUser.uid
        );
        const reportList = await getManagerReports(auth.currentUser.uid);
        console.log("Yüklenen raporlar:", reportList);
        setReports(reportList);
      } else {
        console.log("Kullanıcı giriş yapmamış");
      }
    } catch (error) {
      console.error("Raporlar yüklenirken hata:", error);
      toast.error("Raporlar yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadReports();
    toast.success("Raporlar yenileniyor...");
  };

  const handleMarkAsRead = async (reportId: string) => {
    try {
      await markReportAsRead(reportId);
      toast.success("Rapor okundu olarak işaretlendi");
      loadReports(); // Listeyi yenile
    } catch {
      toast.error("İşlem sırasında bir hata oluştu");
    }
  };

  const handleDownload = (report: Report) => {
    // Raporu indirilebilir formata çevir
    const content = `Rapor Detayı\n\nGönderen: ${
      report.userName
    }\nTarih: ${format(report.createdAt.toDate(), "dd MMMM yyyy HH:mm", {
      locale: tr,
    })}\n\nİçerik:\n${report.content}`;

    // Dosyayı oluştur ve indir
    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rapor_${format(report.createdAt.toDate(), "yyyy-MM-dd")}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (loading) {
    return <Loader className="p-6" />;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gelen Raporlar</h1>
        <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          Yenile
        </Button>
      </div>

      <div className="grid gap-4">
        {reports.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Henüz rapor bulunmuyor.
            </CardContent>
          </Card>
        ) : (
          reports.map((report) => (
            <Card key={report.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {report.userName}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownload(report)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {report.status === "UNREAD" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMarkAsRead(report.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-2">
                  {format(report.createdAt.toDate(), "dd MMMM yyyy HH:mm", {
                    locale: tr,
                  })}
                </div>
                <p className="text-sm">{report.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
