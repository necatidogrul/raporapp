"use client";

import { useEffect } from "react";
import { ReportList } from "@/components/reports/report-list";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { NewReportDialog } from "@/components/reports/new-report-dialog";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useReportStore } from "@/store/report-store";
import { Report } from "@/types/report";
import { toast } from "sonner";

export default function ReportsPage() {
  const [showNewReportDialog, setShowNewReportDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const setReports = useReportStore((state) => state.setReports);

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
        console.log("Bulunan rapor sayısı:", querySnapshot.size);

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

  return (
    <div className="space-y-4 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Raporlarım</h1>
        <Button onClick={() => setShowNewReportDialog(true)}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Yeni Rapor
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Raporlar yükleniyor...</div>
      ) : (
        <ReportList />
      )}

      <NewReportDialog
        open={showNewReportDialog}
        onOpenChange={setShowNewReportDialog}
      />
    </div>
  );
}
