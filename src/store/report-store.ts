/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { Report, ReportStatus } from "@/types/report";
import { Task } from "@/types/task";
import { v4 as uuidv4 } from "uuid";
import {
  doc,
  updateDoc,
  collection,
  addDoc,
  Timestamp,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// Firebase'e rapor gönderme fonksiyonu
async function submitReportToFirebase(report: Report) {
  try {
    console.log("Rapor Firebase'e gönderiliyor:", report);

    // Rapor içeriğini oluştur
    let content = report.description || "";

    // Görevleri ekle
    if (report.tasks && report.tasks.length > 0) {
      content += "\n\n## Görevler\n";
      report.tasks.forEach((task, index) => {
        content += `\n### ${index + 1}. ${task.title}\n`;
        content += `${task.description || "Açıklama yok"}\n`;
        content += `Durum: ${
          task.status === "COMPLETED" ? "Tamamlandı" : "Devam Ediyor"
        }\n`;
      });
    }

    let reportId = "";

    // Eğer rapor zaten Firebase'de varsa güncelle
    if (report.firebaseId) {
      const reportRef = doc(db, "reports", report.firebaseId);
      await updateDoc(reportRef, {
        status: "UNREAD", // Yönetici için UNREAD olarak işaretle
        content: content,
        submittedAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
      });
      reportId = report.firebaseId;
    }
    // Yoksa yeni rapor oluştur
    else {
      const reportData = {
        id: report.id,
        userId: report.userId,
        userName: report.userName,
        managerId: report.managerId,
        managerName: report.managerName || "Yönetici",
        organizationId: report.organizationId,
        organizationName: report.organizationName,
        title: report.title,
        description: report.description,
        content: content, // Detaylı içerik
        status: "UNREAD", // Yönetici için UNREAD olarak işaretle
        createdAt: Timestamp.fromDate(report.createdAt),
        updatedAt: Timestamp.fromDate(new Date()),
        submittedAt: Timestamp.fromDate(new Date()),
        reportType: "DAILY",
        reportPeriod: {
          startDate: Timestamp.fromDate(report.startDate),
          endDate: Timestamp.fromDate(report.endDate),
        },
      };

      const docRef = await addDoc(collection(db, "reports"), reportData);

      // ID'yi dökümanın içine de ekle
      await updateDoc(docRef, {
        id: docRef.id,
      });

      reportId = docRef.id;
      console.log("Rapor Firebase'e başarıyla gönderildi, ID:", docRef.id);
    }

    // Rapor bildirimi oluştur ve gönder
    try {
      const { createReportSubmittedNotification } = await import(
        "@/lib/notification-service"
      );
      const { useNotificationStore } = await import(
        "@/store/notification-store"
      );

      const notification = await createReportSubmittedNotification(
        report.managerId,
        reportId,
        report.title
      );

      if (notification) {
        // Zustand store'a erişim
        const addNotification = useNotificationStore.getState().addNotification;
        addNotification(notification);
        console.log("Rapor bildirimi gönderildi:", notification);
      }
    } catch (notificationError) {
      console.error("Rapor bildirimi gönderilirken hata:", notificationError);
      // Bildirim gönderilmesi başarısız olsa bile işleme devam et
    }

    return reportId;
  } catch (error) {
    console.error("Rapor Firebase'e gönderilirken hata:", error);
    throw error;
  }
}

// Firebase'e yeni rapor oluşturma fonksiyonu
async function createNewReportInFirebase(report: Report) {
  try {
    console.log("Yeni rapor Firebase'e kaydediliyor:", report);

    const reportData = {
      id: report.id,
      userId: report.userId,
      userName: report.userName,
      managerId: report.managerId,
      managerName: report.managerName || "Yönetici",
      organizationId: report.organizationId,
      organizationName: report.organizationName,
      title: report.title,
      description: report.description,
      content: report.description,
      status: "DRAFT", // Taslak olarak işaretle
      createdAt: Timestamp.fromDate(report.createdAt),
      updatedAt: Timestamp.fromDate(report.updatedAt),
      reportType: "DAILY",
      reportPeriod: {
        startDate: Timestamp.fromDate(report.startDate),
        endDate: Timestamp.fromDate(report.endDate),
      },
    };

    const docRef = await addDoc(collection(db, "reports"), reportData);

    // ID'yi dökümanın içine de ekle
    await updateDoc(docRef, {
      id: docRef.id,
    });

    console.log("Yeni rapor Firebase'e başarıyla kaydedildi, ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Yeni rapor Firebase'e kaydedilirken hata:", error);
    throw error;
  }
}

const updateReportInFirebase = async (reportId: string, updatedData: any) => {
  try {
    const reportRef = doc(db, "reports", reportId);
    const dataToUpdate = {
      ...updatedData,
      updatedAt: Timestamp.now().toDate(),
    };
    await updateDoc(reportRef, dataToUpdate);
    return true;
  } catch (error) {
    console.error("Error updating report:", error);
    return false;
  }
};

// Firebase'den raporu silme fonksiyonu
async function deleteReportFromFirebase(reportId: string) {
  try {
    if (!reportId) {
      console.error("Firebase ID bulunamadı, silme işlemi yapılamıyor");
      return;
    }

    console.log("Rapor Firebase'den siliniyor, ID:", reportId);

    const reportRef = doc(db, "reports", reportId);
    await deleteDoc(reportRef);

    console.log("Rapor Firebase'den başarıyla silindi");
  } catch (error) {
    console.error("Rapor Firebase'den silinirken hata:", error);
    throw error;
  }
}

interface ReportState {
  reports: Report[];
  addReport: (report: Report) => void;
  updateReport: (id: string, report: Partial<Report>) => void;
  deleteReport: (id: string) => void;
  setReports: (reports: Report[]) => void;
  addTaskToReport: (reportId: string, task: Task) => void;
  removeTaskFromReport: (reportId: string, taskId: string) => void;
  submitReport: (id: string) => Promise<void>;
  reviewReport: (
    id: string,
    status: "APPROVED" | "REJECTED",
    comment?: string
  ) => void;
  createNewReport: (
    userId: string,
    userName: string,
    managerId: string,
    organizationId: string,
    organizationName: string,
    title: string,
    description: string,
    startDate: Date,
    endDate: Date,
    managerName?: string
  ) => Promise<Report>;
}

export const useReportStore = create<ReportState>((set, get) => ({
  reports: [],

  addReport: (report) =>
    set((state) => ({
      reports: [...state.reports, report],
    })),

  updateReport: async (id, updatedReport) => {
    const currentState = get();
    const report = currentState.reports.find((r) => r.id === id);

    // Önce yerel state'i güncelle
    set((state) => ({
      reports: state.reports.map((report) =>
        report.id === id
          ? { ...report, ...updatedReport, updatedAt: new Date() }
          : report
      ),
    }));

    // Eğer Firebase ID varsa, Firebase'i de güncelle
    if (report?.firebaseId) {
      try {
        await updateReportInFirebase(report.firebaseId, updatedReport);
      } catch (error) {
        console.error("Rapor güncellenirken hata:", error);
      }
    }
  },

  deleteReport: async (id) => {
    const currentState = get();
    const report = currentState.reports.find((r) => r.id === id);

    // Önce yerel state'den sil
    set((state) => ({
      reports: state.reports.filter((report) => report.id !== id),
    }));

    // Eğer Firebase ID varsa, Firebase'den de sil
    if (report?.firebaseId) {
      try {
        await deleteReportFromFirebase(report.firebaseId);
      } catch (error) {
        console.error("Rapor silinirken hata:", error);
      }
    }
  },

  setReports: (reports) => set({ reports }),

  addTaskToReport: async (reportId, task) => {
    const currentState = get();
    const report = currentState.reports.find((r) => r.id === reportId);

    // Önce yerel state'i güncelle
    set((state) => ({
      reports: state.reports.map((report) =>
        report.id === reportId
          ? {
              ...report,
              tasks: [...report.tasks, task],
              updatedAt: new Date(),
            }
          : report
      ),
    }));

    // Eğer Firebase ID varsa, Firebase'i de güncelle
    if (report?.firebaseId) {
      try {
        // Görevleri içeren içeriği güncelle
        const updatedReport = get().reports.find((r) => r.id === reportId);
        if (!updatedReport) return;

        // Rapor içeriğini oluştur
        let content = updatedReport.description || "";

        // Görevleri ekle
        if (updatedReport.tasks && updatedReport.tasks.length > 0) {
          content += "\n\n## Görevler\n";
          updatedReport.tasks.forEach((t, index) => {
            content += `\n### ${index + 1}. ${t.title}\n`;
            content += `${t.description || "Açıklama yok"}\n`;
            content += `Durum: ${
              t.status === "COMPLETED" ? "Tamamlandı" : "Devam Ediyor"
            }\n`;
          });
        }

        await updateReportInFirebase(report.firebaseId, {
          content: content,
          updatedAt: Timestamp.fromDate(new Date()),
        });
      } catch (error) {
        console.error("Görev eklenirken Firebase güncellenemedi:", error);
      }
    }
  },

  removeTaskFromReport: async (reportId, taskId) => {
    const currentState = get();
    const report = currentState.reports.find((r) => r.id === reportId);

    // Önce yerel state'i güncelle
    set((state) => ({
      reports: state.reports.map((report) =>
        report.id === reportId
          ? {
              ...report,
              tasks: report.tasks.filter((task) => task.id !== taskId),
              updatedAt: new Date(),
            }
          : report
      ),
    }));

    // Eğer Firebase ID varsa, Firebase'i de güncelle
    if (report?.firebaseId) {
      try {
        // Görevleri içeren içeriği güncelle
        const updatedReport = get().reports.find((r) => r.id === reportId);
        if (!updatedReport) return;

        // Rapor içeriğini oluştur
        let content = updatedReport.description || "";

        // Görevleri ekle
        if (updatedReport.tasks && updatedReport.tasks.length > 0) {
          content += "\n\n## Görevler\n";
          updatedReport.tasks.forEach((t, index) => {
            content += `\n### ${index + 1}. ${t.title}\n`;
            content += `${t.description || "Açıklama yok"}\n`;
            content += `Durum: ${
              t.status === "COMPLETED" ? "Tamamlandı" : "Devam Ediyor"
            }\n`;
          });
        }

        await updateReportInFirebase(report.firebaseId, {
          content: content,
          updatedAt: Timestamp.fromDate(new Date()),
        });
      } catch (error) {
        console.error("Görev silinirken Firebase güncellenemedi:", error);
      }
    }
  },

  submitReport: async (id) => {
    const report = get().reports.find((r) => r.id === id);
    if (!report) return;

    try {
      // Firebase'e raporu gönder
      const firebaseId = await submitReportToFirebase(report);

      // Yerel state'i güncelle
      set((state) => ({
        reports: state.reports.map((r) =>
          r.id === id
            ? {
                ...r,
                status: "SUBMITTED" as ReportStatus,
                submittedAt: new Date(),
                updatedAt: new Date(),
                firebaseId: firebaseId, // Firebase ID'sini kaydet
              }
            : r
        ),
      }));
    } catch (error) {
      console.error("Rapor gönderilirken hata:", error);
      throw error;
    }
  },

  reviewReport: (id, status, comment) => {
    // Önce yerel durumu güncelleyelim
    set((state) => {
      const updatedReports = state.reports.map((report) =>
        report.id === id
          ? {
              ...report,
              status: status as ReportStatus,
              reviewedAt: new Date(),
              updatedAt: new Date(),
              managerComment: comment,
            }
          : report
      );

      // Rapor bilgilerini alın
      const reviewedReport = updatedReports.find((r) => r.id === id);

      // Firebase'i güncelleyelim ve bildirim oluşturalım (asenkron)
      if (reviewedReport) {
        // Firebase güncellemesi
        const reportRef = doc(db, "reports", reviewedReport.firebaseId || id);
        updateDoc(reportRef, {
          status: status,
          reviewedAt: Timestamp.fromDate(new Date()),
          updatedAt: Timestamp.fromDate(new Date()),
          managerComment: comment || "",
        })
          .then(() => {
            console.log("Rapor değerlendirmesi Firebase'e kaydedildi");

            // Bildirim gönderme
            (async () => {
              try {
                let notification = null;

                // Duruma göre bildirim oluştur
                if (status === "APPROVED") {
                  const { createReportApprovedNotification } = await import(
                    "@/lib/notification-service"
                  );
                  notification = await createReportApprovedNotification(
                    reviewedReport.userId,
                    reviewedReport.firebaseId || id,
                    reviewedReport.title
                  );
                } else if (status === "REJECTED") {
                  const { createReportRejectedNotification } = await import(
                    "@/lib/notification-service"
                  );
                  notification = await createReportRejectedNotification(
                    reviewedReport.userId,
                    reviewedReport.firebaseId || id,
                    reviewedReport.title,
                    comment
                  );
                }

                // Oluşturulan bildirimi store'a ekle
                if (notification) {
                  const { useNotificationStore } = await import(
                    "@/store/notification-store"
                  );
                  const addNotification =
                    useNotificationStore.getState().addNotification;
                  addNotification(notification);
                  console.log(
                    "Rapor değerlendirme bildirimi gönderildi:",
                    notification
                  );
                }
              } catch (error) {
                console.error("Bildirim oluşturulurken hata:", error);
              }
            })();
          })
          .catch((error) => {
            console.error("Rapor değerlendirmesi güncellenirken hata:", error);
          });
      }

      return { reports: updatedReports };
    });
  },

  createNewReport: async (
    userId,
    userName,
    managerId,
    organizationId,
    organizationName,
    title,
    description,
    startDate,
    endDate,
    managerName
  ) => {
    const newReport: Report = {
      id: uuidv4(),
      userId,
      userName,
      managerId,
      managerName: managerName || "Yönetici",
      organizationId,
      organizationName,
      title,
      description,
      startDate,
      endDate,
      status: "DRAFT",
      tasks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      // Firebase'e kaydet
      const firebaseId = await createNewReportInFirebase(newReport);

      // Firebase ID'sini ekle
      newReport.firebaseId = firebaseId;

      // Yerel state'e ekle
      set((state) => ({
        reports: [...state.reports, newReport],
      }));

      return newReport;
    } catch (error) {
      console.error("Rapor oluşturulurken hata:", error);

      // Hata olsa bile yerel state'e ekle
      set((state) => ({
        reports: [...state.reports, newReport],
      }));

      return newReport;
    }
  },
}));
