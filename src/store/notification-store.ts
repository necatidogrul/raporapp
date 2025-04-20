import { create } from "zustand";
import {
  Notification,
  NotificationStore,
  NotificationStatus,
} from "@/types/notification";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { toast } from "sonner";

// Firebase'e bildirim ekle
async function addNotificationToFirebase(notification: Notification) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...notificationWithoutId } = notification;

    const notificationData = {
      ...notificationWithoutId,
      createdAt: Timestamp.fromDate(notification.createdAt),
      readAt: notification.readAt
        ? Timestamp.fromDate(notification.readAt)
        : null,
    };

    const docRef = await addDoc(
      collection(db, "notifications"),
      notificationData
    );

    return docRef.id;
  } catch (error) {
    console.error("Bildirim eklenirken hata oluştu:", error);
    throw error;
  }
}

// Firebase'den bildirim sil
async function deleteNotificationFromFirebase(id: string) {
  try {
    await deleteDoc(doc(db, "notifications", id));
  } catch (error) {
    console.error("Bildirim silinirken hata oluştu:", error);
    throw error;
  }
}

// Firebase'de bildirimi okundu olarak işaretle
async function markNotificationAsReadInFirebase(id: string) {
  try {
    const notificationRef = doc(db, "notifications", id);
    await updateDoc(notificationRef, {
      status: "READ" as NotificationStatus,
      readAt: Timestamp.fromDate(new Date()),
    });
  } catch (error) {
    console.error("Bildirim okundu işaretlenirken hata oluştu:", error);
    throw error;
  }
}

// Firebase'de tüm bildirimleri okundu olarak işaretle
async function markAllNotificationsAsReadInFirebase(userId: string) {
  try {
    const notificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      where("status", "==", "UNREAD")
    );

    const querySnapshot = await getDocs(notificationsQuery);

    // Her birini güncelle
    const batch: Promise<void>[] = [];
    querySnapshot.forEach((document) => {
      const notificationRef = doc(db, "notifications", document.id);
      batch.push(
        updateDoc(notificationRef, {
          status: "READ" as NotificationStatus,
          readAt: Timestamp.fromDate(new Date()),
        })
      );
    });

    await Promise.all(batch);
  } catch (error) {
    console.error("Tüm bildirimler okundu işaretlenirken hata oluştu:", error);
    throw error;
  }
}

// Firebase'den kullanıcının bildirimlerini al
export async function fetchUserNotifications(userId: string) {
  try {
    if (!userId) {
      console.error("fetchUserNotifications: userId bulunamadı");
      return [];
    }

    console.log(`Kullanıcı bildirimleri yükleniyor: ${userId}`);

    const notificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(notificationsQuery);
    const notifications: Notification[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      notifications.push({
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        readAt: data.readAt ? data.readAt.toDate() : undefined,
      } as Notification);
    });

    console.log(`Toplam ${notifications.length} bildirim yüklendi`);
    return notifications;
  } catch (error) {
    console.error("Bildirimler alınırken hata oluştu:", error);
    // Firestore yetki hataları için daha spesifik mesaj
    if (error instanceof Error && error.toString().includes("permission")) {
      console.warn(
        "Firebase izin hatası: Firestore kurallarınızı kontrol edin"
      );
    }
    return []; // Hata olsa bile boş dizi dön (uygulama çalışmaya devam edebilsin)
  }
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,

  // Bildirim ekle
  addNotification: (notification: Notification) => {
    // Firebase'e ekle
    if (auth.currentUser) {
      addNotificationToFirebase(notification)
        .then((newId) => {
          // Firebase'den dönen ID ile notification'ı güncelle
          const updatedNotification = {
            ...notification,
            id: newId,
          };

          // Zustand store'a ekle
          set((state) => ({
            notifications: [updatedNotification, ...state.notifications],
            unreadCount:
              state.unreadCount +
              (updatedNotification.status === "UNREAD" ? 1 : 0),
          }));
        })
        .catch((error) => {
          console.error("Bildirim eklenirken hata oluştu:", error);
          toast.error("Bildirim eklenirken bir hata oluştu");
        });
    } else {
      // Eğer kullanıcı giriş yapmamışsa (nadir durum), sadece local store'a ekle
      set((state) => ({
        notifications: [notification, ...state.notifications],
        unreadCount:
          state.unreadCount + (notification.status === "UNREAD" ? 1 : 0),
      }));
    }
  },

  // Bildirimi okundu olarak işaretle
  markAsRead: (id: string) => {
    set((state) => {
      const updatedNotifications = state.notifications.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              status: "READ" as NotificationStatus,
              readAt: new Date(),
            }
          : notification
      );

      const newUnreadCount = updatedNotifications.filter(
        (notification) => notification.status === "UNREAD"
      ).length;

      return {
        notifications: updatedNotifications,
        unreadCount: newUnreadCount,
      };
    });

    // Firebase'de güncelle
    markNotificationAsReadInFirebase(id).catch((error) => {
      console.error("Bildirim okundu işaretlenirken hata oluştu:", error);
    });
  },

  // Tüm bildirimleri okundu olarak işaretle
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((notification) => ({
        ...notification,
        status: "READ" as NotificationStatus,
        readAt: notification.readAt || new Date(),
      })),
      unreadCount: 0,
    }));

    // Firebase'de güncelle
    if (auth.currentUser) {
      markAllNotificationsAsReadInFirebase(auth.currentUser.uid).catch(
        (error) => {
          console.error(
            "Tüm bildirimler okundu işaretlenirken hata oluştu:",
            error
          );
        }
      );
    }
  },

  // Bildirim sil
  deleteNotification: (id: string) => {
    set((state) => {
      const notificationToDelete = state.notifications.find(
        (notification) => notification.id === id
      );

      const updatedNotifications = state.notifications.filter(
        (notification) => notification.id !== id
      );

      const newUnreadCount =
        notificationToDelete?.status === "UNREAD"
          ? state.unreadCount - 1
          : state.unreadCount;

      return {
        notifications: updatedNotifications,
        unreadCount: Math.max(0, newUnreadCount),
      };
    });

    // Firebase'den sil
    deleteNotificationFromFirebase(id).catch((error) => {
      console.error("Bildirim silinirken hata oluştu:", error);
    });
  },

  // Bildirimleri ayarla
  setNotifications: (notifications: Notification[]) => {
    const unreadCount = notifications.filter(
      (notification) => notification.status === "UNREAD"
    ).length;

    set({
      notifications,
      unreadCount,
    });
  },

  // Okunmamış bildirimleri güncelle
  updateUnreadCount: () => {
    set((state) => ({
      unreadCount: state.notifications.filter(
        (notification) => notification.status === "UNREAD"
      ).length,
    }));
  },
}));
