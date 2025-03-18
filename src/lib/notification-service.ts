import { v4 as uuidv4 } from "uuid";
import { Notification, NotificationType } from "@/types/notification";
import { auth } from "@/lib/firebase";
import { getUserData } from "@/lib/firebase-utils";

// Yeni bildirim oluşturma yardımcı işlevi
export const createNotification = (
  userId: string,
  title: string,
  message: string,
  type: NotificationType,
  options?: {
    relatedItemId?: string;
    relatedItemType?: "REPORT" | "TASK" | "INVITATION";
    senderName?: string;
    senderUserId?: string;
  }
): Notification => {
  return {
    id: uuidv4(),
    userId,
    title,
    message,
    type,
    status: "UNREAD",
    createdAt: new Date(),
    ...options,
  };
};

// Rapor gönderildiğinde yöneticiye bildirim oluştur
export const createReportSubmittedNotification = async (
  managerId: string,
  reportId: string,
  reportTitle: string
): Promise<Notification | null> => {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;

  const userData = await getUserData(currentUser.uid);
  if (!userData) return null;

  return createNotification(
    managerId,
    "Yeni Rapor Gönderildi",
    `${userData.name} tarafından "${reportTitle}" raporu gönderildi.`,
    "REPORT_SUBMITTED",
    {
      relatedItemId: reportId,
      relatedItemType: "REPORT",
      senderName: userData.name,
      senderUserId: currentUser.uid,
    }
  );
};

// Rapor onaylandığında çalışana bildirim oluştur
export const createReportApprovedNotification = async (
  userId: string,
  reportId: string,
  reportTitle: string
): Promise<Notification | null> => {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;

  const userData = await getUserData(currentUser.uid);
  if (!userData) return null;

  return createNotification(
    userId,
    "Rapor Onaylandı",
    `"${reportTitle}" raporunuz ${userData.name} tarafından onaylandı.`,
    "REPORT_APPROVED",
    {
      relatedItemId: reportId,
      relatedItemType: "REPORT",
      senderName: userData.name,
      senderUserId: currentUser.uid,
    }
  );
};

// Rapor reddedildiğinde çalışana bildirim oluştur
export const createReportRejectedNotification = async (
  userId: string,
  reportId: string,
  reportTitle: string,
  reason?: string
): Promise<Notification | null> => {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;

  const userData = await getUserData(currentUser.uid);
  if (!userData) return null;

  let message = `"${reportTitle}" raporunuz ${userData.name} tarafından reddedildi.`;
  if (reason) {
    message += ` Sebep: ${reason}`;
  }

  return createNotification(
    userId,
    "Rapor Reddedildi",
    message,
    "REPORT_REJECTED",
    {
      relatedItemId: reportId,
      relatedItemType: "REPORT",
      senderName: userData.name,
      senderUserId: currentUser.uid,
    }
  );
};

// Görev atandığında çalışana bildirim oluştur
export const createTaskAssignedNotification = async (
  userId: string,
  taskId: string,
  taskTitle: string
): Promise<Notification | null> => {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;

  const userData = await getUserData(currentUser.uid);
  if (!userData) return null;

  return createNotification(
    userId,
    "Yeni Görev Atandı",
    `${userData.name} tarafından size "${taskTitle}" görevi atandı.`,
    "TASK_ASSIGNED",
    {
      relatedItemId: taskId,
      relatedItemType: "TASK",
      senderName: userData.name,
      senderUserId: currentUser.uid,
    }
  );
};

// Görev tamamlandığında yöneticiye bildirim oluştur
export const createTaskCompletedNotification = async (
  managerId: string,
  taskId: string,
  taskTitle: string
): Promise<Notification | null> => {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;

  const userData = await getUserData(currentUser.uid);
  if (!userData) return null;

  return createNotification(
    managerId,
    "Görev Tamamlandı",
    `${userData.name} "${taskTitle}" görevini tamamladı.`,
    "TASK_COMPLETED",
    {
      relatedItemId: taskId,
      relatedItemType: "TASK",
      senderName: userData.name,
      senderUserId: currentUser.uid,
    }
  );
};

// Organizasyon davetiyesi gönderildiğinde kullanıcıya bildirim oluştur
export const createOrgInvitationNotification = async (
  userId: string,
  invitationId: string,
  organizationName: string
): Promise<Notification | null> => {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;

  const userData = await getUserData(currentUser.uid);
  if (!userData) return null;

  return createNotification(
    userId,
    "Organizasyon Davetiyesi",
    `${userData.name} sizi "${organizationName}" organizasyonuna davet etti.`,
    "ORG_INVITATION",
    {
      relatedItemId: invitationId,
      relatedItemType: "INVITATION",
      senderName: userData.name,
      senderUserId: currentUser.uid,
    }
  );
};
