import { db, auth } from "./firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
  orderBy,
  setDoc,
  getDoc,
  arrayUnion,
  writeBatch,
} from "firebase/firestore";
import { User } from "firebase/auth";
import { Task } from "@/types/task";

// Rapor tipi
export interface Report {
  id: string;
  userId: string;
  userName: string;
  managerId: string;
  managerName?: string;
  organizationId: string;
  organizationName?: string;
  title?: string;
  description?: string;
  content: string;
  status: "READ" | "UNREAD" | "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  readAt?: Timestamp;
  submittedAt?: Timestamp;
  reviewedAt?: Timestamp;
  managerComment?: string;
  tasks?: Task[];
  reportType: "DAILY" | "WEEKLY" | "MONTHLY";
  reportPeriod: {
    startDate: Timestamp;
    endDate: Timestamp;
  };
}

// Kullanıcı tipi
export interface UserData {
  id: string;
  email: string;
  name: string;
  role: "user" | "manager";
  createdAt: Timestamp;
  phone?: string;
  title?: string;
  department?: string;
  photoURL?: string;
}

// Organizasyon tipi
export interface Organization {
  id: string;
  name: string;
  managerId: string;
  description?: string;
  createdAt: Timestamp;
  members: string[]; // Üye kullanıcı ID'leri
  logo?: string; // Logo alanını ekledim
}

// Davetiye tipi
export interface Invitation {
  id: string;
  organizationId: string;
  organizationName: string;
  managerId: string;
  managerName: string;
  userId: string;
  userEmail: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: Timestamp;
}

// Yeni rapor oluşturma
export async function createReport(data: {
  userId: string;
  userName: string;
  managerId: string;
  managerName?: string;
  organizationId: string;
  content: string;
}) {
  try {
    // Kullanıcı kontrolü
    if (!auth.currentUser) {
      throw new Error("Bu işlem için giriş yapmanız gerekiyor");
    }

    // Organizasyon kontrolü
    const orgRef = doc(db, "organizations", data.organizationId);
    const orgSnap = await getDoc(orgRef);

    if (!orgSnap.exists()) {
      throw new Error("Organizasyon bulunamadı");
    }

    const organization = orgSnap.data() as Organization;

    // Yönetici ID'sini organizasyondan al
    const managerId = organization.managerId;

    // Yönetici adını al
    let managerName = data.managerName;
    if (!managerName) {
      try {
        const managerData = await getUserData(managerId);
        managerName = managerData?.name || "Yönetici";
      } catch (error) {
        console.error("Yönetici bilgileri alınırken hata:", error);
        managerName = "Yönetici";
      }
    }

    const reportData = {
      userId: data.userId,
      userName: data.userName,
      managerId: managerId, // Organizasyondan alınan yönetici ID'si
      managerName: managerName,
      organizationId: data.organizationId,
      content: data.content,
      status: "UNREAD",
      createdAt: Timestamp.now(),
      reportType: "DAILY",
      reportPeriod: {
        startDate: Timestamp.now(),
        endDate: Timestamp.now(),
      },
    };

    const docRef = await addDoc(collection(db, "reports"), reportData);

    // ID'yi dökümanın içine de ekle
    await updateDoc(docRef, {
      id: docRef.id,
    });

    return docRef.id;
  } catch (error) {
    console.error("Rapor oluşturulurken hata:", error);
    throw error;
  }
}

// Yöneticiye ait raporları getirme
export async function getManagerReports(
  managerId: string,
  organizationId?: string
) {
  try {
    // Temel sorgu koşullarını oluştur
    const conditions = [
      where("managerId", "==", managerId),
      orderBy("createdAt", "desc"),
    ];

    // Eğer organizationId belirtilmişse, filtreye ekle
    if (organizationId) {
      conditions.unshift(where("organizationId", "==", organizationId));
    }

    // Sorguyu oluştur
    const q = query(collection(db, "reports"), ...conditions);

    const querySnapshot = await getDocs(q);

    const reports = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      };
    }) as Report[];

    return reports;
  } catch (error) {
    console.error("Raporlar getirilirken hata:", error);
    throw error;
  }
}

// Raporu okundu olarak işaretleme
export async function markReportAsRead(reportId: string) {
  try {
    const reportRef = doc(db, "reports", reportId);
    await updateDoc(reportRef, {
      status: "READ",
      readAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Rapor durumu güncellenirken hata:", error);
    throw error;
  }
}

// Kullanıcının yöneticilerini getirme
export async function getUserManagers() {
  try {
    const q = query(collection(db, "users"), where("role", "==", "manager"));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as UserData[];
  } catch (error) {
    console.error("Yöneticiler getirilirken hata:", error);
    throw error;
  }
}

// Yeni kullanıcı oluşturma veya güncelleme
export async function createOrUpdateUser(
  user: User,
  role: "user" | "manager" = "user"
) {
  try {
    const userRef = doc(db, "users", user.uid);
    await setDoc(
      userRef,
      {
        id: user.uid,
        email: user.email,
        name:
          user.displayName || user.email?.split("@")[0] || "İsimsiz Kullanıcı",
        role: role,
        createdAt: Timestamp.now(),
      },
      { merge: true }
    );

    // Firebase Auth token'ını alıp cookie olarak saklayalım
    try {
      const token = await user.getIdToken();

      // Tarayıcı ortamında çalışıyorsa cookie'yi ayarla
      if (typeof window !== "undefined") {
        // Güvenli cookie ayarları
        document.cookie = `__session=${token}; path=/; max-age=86400; SameSite=Strict; ${
          window.location.protocol === "https:" ? "Secure;" : ""
        }`;
      }
    } catch (tokenError) {
      console.error("Kimlik doğrulama token'ı alınırken hata:", tokenError);
    }
  } catch (error) {
    console.error("Kullanıcı oluşturulurken hata:", error);
    throw error;
  }
}

// Kullanıcı rolünü güncelleme
export async function updateUserRole(
  userId: string,
  newRole: "user" | "manager"
) {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      role: newRole,
    });
  } catch (error) {
    console.error("Kullanıcı rolü güncellenirken hata:", error);
    throw error;
  }
}

// Kullanıcı bilgilerini güncelleme
export async function updateUserData(
  userId: string,
  data: {
    name?: string;
    phone?: string;
    title?: string;
    department?: string;
    photoURL?: string;
  }
) {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Kullanıcı bilgileri güncellenirken hata:", error);
    throw error;
  }
}

// Kullanıcı bilgilerini getirme
export async function getUserData(userId: string): Promise<UserData | null> {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return null;
    }

    return userSnap.data() as UserData;
  } catch (error) {
    console.error("Kullanıcı bilgileri getirilirken hata:", error);
    throw error;
  }
}

// Organizasyon oluşturma
export async function createOrganization(data: {
  name: string;
  description?: string;
  managerId: string;
  logo?: string; // Logo parametresini ekledim
}) {
  try {
    // Kullanıcı kontrolü
    if (!auth.currentUser) {
      throw new Error("Bu işlem için giriş yapmanız gerekiyor");
    }

    // Kullanıcının organizasyon oluşturma yetkisi var mı?
    const userRef = doc(db, "users", data.managerId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error("Kullanıcı bulunamadı");
    }

    const userData = userSnap.data() as UserData;

    // Organizasyon oluşturma
    const orgRef = collection(db, "organizations");
    const docRef = await addDoc(orgRef, {
      name: data.name,
      description: data.description || "",
      managerId: data.managerId,
      createdAt: Timestamp.now(),
      members: [data.managerId], // Yönetici aynı zamanda ilk üye
      logo: data.logo || "Building", // Logo değerini ekledim, varsayılan olarak Building
    });

    // ID'yi organizasyon objesine ekle
    await updateDoc(docRef, {
      id: docRef.id,
    });

    // Kullanıcının rolünü yönetici olarak güncelle
    if (userData.role === "user") {
      await updateDoc(userRef, {
        role: "manager",
      });
    }

    return docRef.id;
  } catch (error) {
    console.error("Organizasyon oluşturulurken hata:", error);
    throw error;
  }
}

// E-posta adresine göre kullanıcı getirme
export async function getUserByEmail(email: string) {
  try {
    const q = query(
      collection(db, "users"),
      where("email", "==", email.toLowerCase())
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const userData = querySnapshot.docs[0].data();
    return {
      id: querySnapshot.docs[0].id,
      ...userData,
    } as UserData;
  } catch (error) {
    console.error("Kullanıcı aranırken hata:", error);
    throw error;
  }
}

// Organizasyon davetiyesi gönderme
export async function sendInvitation(data: {
  organizationId: string;
  organizationName: string;
  managerId: string;
  managerName: string;
  recipientEmail: string;
}) {
  try {
    // Giriş yapmış kullanıcı kontrolü
    if (!auth.currentUser) {
      throw new Error("Bu işlem için giriş yapmanız gerekiyor");
    }

    // Kendini davet etmeyi engelle
    if (auth.currentUser.email === data.recipientEmail) {
      throw new Error("Kendinizi davet edemezsiniz");
    }

    // Önce e-posta adresine göre kullanıcıyı bul
    const userQuery = query(
      collection(db, "users"),
      where("email", "==", data.recipientEmail)
    );
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
      throw new Error(
        "Bu e-posta adresine sahip kayıtlı bir kullanıcı bulunmamaktadır"
      );
    }

    const user = {
      id: userSnapshot.docs[0].id,
      ...userSnapshot.docs[0].data(),
    } as UserData;

    // Organizasyon bilgilerini getir
    const orgRef = doc(db, "organizations", data.organizationId);
    const orgDoc = await getDoc(orgRef);

    if (!orgDoc.exists()) {
      throw new Error("Organizasyon bulunamadı");
    }

    const orgData = orgDoc.data() as Organization;

    // Yönetici kontrolü
    if (orgData.managerId !== auth.currentUser.uid) {
      throw new Error("Bu işlem için yetkiniz yok");
    }

    // Zaten üye mi kontrol et
    if (orgData.members.includes(user.id)) {
      throw new Error("Bu kullanıcı zaten organizasyon üyesi");
    }

    // Zaten davet edilmiş mi kontrol et
    const existingInviteQuery = query(
      collection(db, "invitations"),
      where("organizationId", "==", data.organizationId),
      where("userId", "==", user.id),
      where("status", "==", "PENDING")
    );

    const existingInvites = await getDocs(existingInviteQuery);
    if (!existingInvites.empty) {
      throw new Error("Bu kullanıcı zaten davet edilmiş");
    }

    // Davetiyeyi oluştur
    const invitationData = {
      organizationId: data.organizationId,
      organizationName: data.organizationName,
      managerId: auth.currentUser.uid, // Mevcut kullanıcının ID'sini kullan
      managerName: data.managerName,
      userId: user.id,
      userEmail: user.email,
      status: "PENDING",
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, "invitations"), invitationData);

    // ID'yi dökümanın içine de ekle
    await updateDoc(docRef, {
      id: docRef.id,
    });

    // Davetiye bildirimi oluştur ve gönder
    try {
      const { createOrgInvitationNotification } = await import(
        "@/lib/notification-service"
      );
      const { useNotificationStore } = await import(
        "@/store/notification-store"
      );

      const notification = await createOrgInvitationNotification(
        user.id,
        docRef.id,
        data.organizationName
      );

      if (notification) {
        // Zustand store'a erişim
        const addNotification = useNotificationStore.getState().addNotification;
        addNotification(notification);
      }
    } catch (notificationError) {
      console.error(
        "Davetiye bildirimi gönderilirken hata:",
        notificationError
      );
      // Bildirim gönderilmesi başarısız olsa bile işleme devam et
    }

    return docRef.id;
  } catch (error) {
    console.error("Davetiye gönderilirken hata:", error);
    throw error;
  }
}

// Davetiyeyi kabul etme
export async function acceptInvitation(invitationId: string) {
  try {
    // Kullanıcı kontrolü
    if (!auth.currentUser) {
      throw new Error("Bu işlem için giriş yapmanız gerekiyor");
    }

    const invitationRef = doc(db, "invitations", invitationId);
    const invitationSnap = await getDoc(invitationRef);

    if (!invitationSnap.exists()) {
      throw new Error("Davetiye bulunamadı");
    }

    const invitation = invitationSnap.data() as Invitation;

    // Davetiyenin durumunu kontrol et
    if (invitation.status !== "PENDING") {
      throw new Error("Bu davetiye zaten işlenmiş");
    }

    // Davetiyenin sahibi olup olmadığını kontrol et
    if (invitation.userId !== auth.currentUser.uid) {
      throw new Error("Bu davetiyeyi kabul etme yetkiniz yok");
    }

    // Organizasyon kontrolü
    const orgRef = doc(db, "organizations", invitation.organizationId);
    const orgSnap = await getDoc(orgRef);

    if (!orgSnap.exists()) {
      throw new Error("Organizasyon bulunamadı");
    }

    const organization = orgSnap.data() as Organization;

    // Zaten üye mi kontrol et
    if (organization.members.includes(auth.currentUser.uid)) {
      throw new Error("Zaten bu organizasyonun üyesisiniz");
    }

    // Önce davetiyeyi güncelle
    await updateDoc(invitationRef, {
      status: "ACCEPTED",
    });

    // Sonra organizasyonu güncelle
    await updateDoc(orgRef, {
      members: arrayUnion(auth.currentUser.uid),
    });

    return true;
  } catch (error) {
    console.error("Davetiye kabul edilirken hata:", error);
    throw error;
  }
}

// Davetiyeyi reddetme
export async function rejectInvitation(invitationId: string) {
  try {
    const invitationRef = doc(db, "invitations", invitationId);
    await updateDoc(invitationRef, {
      status: "REJECTED",
    });
  } catch (error) {
    console.error("Davetiye reddedilirken hata:", error);
    throw error;
  }
}

// Kullanıcının organizasyonlarını getirme
export async function getUserOrganizations(userId: string) {
  try {
    const q = query(
      collection(db, "organizations"),
      where("members", "array-contains", userId)
    );

    const querySnapshot = await getDocs(q);
    const organizations = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Organization[];

    // Yönetici olduğu organizasyonları da getir
    const managerQ = query(
      collection(db, "organizations"),
      where("managerId", "==", userId)
    );

    const managerSnapshot = await getDocs(managerQ);
    const managerOrgs = managerSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Organization[];

    // Tekrarlayan organizasyonları filtrele
    const allOrgs = [...organizations, ...managerOrgs];
    const uniqueOrgs = allOrgs.filter(
      (org, index, self) => index === self.findIndex((o) => o.id === org.id)
    );

    return uniqueOrgs;
  } catch (error) {
    console.error("Organizasyonlar getirilirken hata:", error);
    throw error;
  }
}

// Kullanıcının bekleyen davetiyelerini getirme
export async function getPendingInvitations(userId: string) {
  try {
    const q = query(
      collection(db, "invitations"),
      where("userId", "==", userId),
      where("status", "==", "PENDING")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Invitation[];
  } catch (error) {
    console.error("Davetiyeler getirilirken hata:", error);
    throw error;
  }
}

// Organizasyon üyelerini getirme
export async function getOrganizationMembers(organizationId: string) {
  try {
    const orgRef = doc(db, "organizations", organizationId);
    const orgSnap = await getDoc(orgRef);

    if (!orgSnap.exists()) {
      throw new Error("Organizasyon bulunamadı");
    }

    const organization = orgSnap.data() as Organization;

    // Yöneticiyi her zaman üye olarak ekle
    const managerRef = doc(db, "users", organization.managerId);
    const managerSnap = await getDoc(managerRef);
    const managerData = managerSnap.exists()
      ? (managerSnap.data() as UserData)
      : null;

    // Eğer members dizisi yoksa veya boşsa sadece yöneticiyi döndür
    if (
      !organization.members ||
      !Array.isArray(organization.members) ||
      organization.members.length === 0
    ) {
      return managerData ? [managerData] : [];
    }

    // Diğer üyeleri getir - yöneticiyi hariç tut
    const memberPromises = organization.members
      .filter((memberId) => memberId !== organization.managerId) // Yöneticiyi filtrele
      .map(async (memberId) => {
        const userSnap = await getDoc(doc(db, "users", memberId));
        return userSnap.exists() ? (userSnap.data() as UserData) : null;
      });

    const members = await Promise.all(memberPromises);

    // null değerleri filtrele ve yöneticiyi ekle
    const validMembers = members.filter((member) => member !== null);
    return managerData ? [managerData, ...validMembers] : validMembers;
  } catch (error) {
    console.error("Üyeler getirilirken hata:", error);
    throw error;
  }
}

// Organizasyonu silme
export async function deleteOrganization(organizationId: string) {
  try {
    if (!auth.currentUser) {
      throw new Error("Bu işlem için giriş yapmanız gerekiyor");
    }

    // Organizasyon kontrolü
    const orgRef = doc(db, "organizations", organizationId);
    const orgSnap = await getDoc(orgRef);

    if (!orgSnap.exists()) {
      throw new Error("Organizasyon bulunamadı");
    }

    const organization = orgSnap.data() as Organization;

    // Yönetici kontrolü
    if (organization.managerId !== auth.currentUser.uid) {
      throw new Error("Bu işlem için yetkiniz yok");
    }

    // Bekleyen davetiyeleri getir
    const invitesQuery = query(
      collection(db, "invitations"),
      where("organizationId", "==", organizationId),
      where("status", "==", "PENDING")
    );
    const invitesSnap = await getDocs(invitesQuery);

    // Batch işlemi başlat
    const batch = writeBatch(db);

    // Bekleyen davetiyeleri sil
    invitesSnap.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Organizasyonu sil
    batch.delete(orgRef);

    // Batch işlemini uygula
    await batch.commit();
  } catch (error) {
    console.error("Organizasyon silinirken hata:", error);
    throw error;
  }
}

// Organizasyonun tüm davetlerini getirme
export async function getOrganizationInvitations(organizationId: string) {
  try {
    if (!auth.currentUser) {
      console.log("Giriş yapmadan davetler getirilemez");
      return [];
    }

    // Organizasyon kontrolü
    const orgRef = doc(db, "organizations", organizationId);
    const orgSnap = await getDoc(orgRef);

    if (!orgSnap.exists()) {
      console.log("Organizasyon bulunamadı");
      return [];
    }

    const organization = orgSnap.data() as Organization;

    // Kullanıcının yönetici olup olmadığını kontrol et
    const isManager = organization.managerId === auth.currentUser.uid;

    // Sadece yöneticiler davetleri görebilir
    if (!isManager) {
      console.log("Davetleri görüntülemek için yönetici olmanız gerekiyor");
      return [];
    }

    try {
      // Değişiklik: Sorguya managerId ekleyerek güvenlik kurallarına uygun hale getirme
      const q = query(
        collection(db, "invitations"),
        where("organizationId", "==", organizationId),
        where("managerId", "==", auth.currentUser.uid)
      );

      const querySnapshot = await getDocs(q);
      const invitations = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Invitation[];

      // Davetleri tarihe göre sırala
      return invitations.sort(
        (a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()
      );
    } catch (innerError) {
      console.error("Davetler sorgulanırken hata:", innerError);
      return [];
    }
  } catch (error) {
    console.error("Organizasyon davetleri getirilirken hata:", error);
    // Hata mesajını göster ama hatayı yukarı fırlatma
    return [];
  }
}

// Organizasyon güncelleme
export async function updateOrganization(
  organizationId: string,
  data: {
    name: string;
    description?: string;
  }
) {
  try {
    if (!auth.currentUser) {
      throw new Error("Bu işlem için giriş yapmanız gerekiyor");
    }

    const orgRef = doc(db, "organizations", organizationId);
    const orgSnap = await getDoc(orgRef);

    if (!orgSnap.exists()) {
      throw new Error("Organizasyon bulunamadı");
    }

    const organization = orgSnap.data() as Organization;

    // Yönetici kontrolü
    if (organization.managerId !== auth.currentUser.uid) {
      throw new Error("Bu işlem için yetkiniz yok");
    }

    await updateDoc(orgRef, {
      name: data.name,
      description: data.description || "",
    });
  } catch (error) {
    console.error("Organizasyon güncellenirken hata:", error);
    throw error;
  }
}

// Haftalık rapor oluşturma
export async function createWeeklyReport(data: {
  userId: string;
  userName: string;
  managerId: string;
  organizationId: string;
  content: string;
  weekStartDate: Date;
  weekEndDate: Date;
}) {
  try {
    console.log("Haftalık rapor oluşturuluyor:", data);

    // Kullanıcı kontrolü
    if (!auth.currentUser) {
      throw new Error("Bu işlem için giriş yapmanız gerekiyor");
    }

    // Organizasyon kontrolü
    const orgRef = doc(db, "organizations", data.organizationId);
    const orgSnap = await getDoc(orgRef);

    if (!orgSnap.exists()) {
      throw new Error("Organizasyon bulunamadı");
    }

    const organization = orgSnap.data() as Organization;

    // Yönetici ID'sini organizasyondan al
    const managerId = organization.managerId;

    // Önce aynı hafta için rapor var mı kontrol et
    const weekStartTimestamp = Timestamp.fromDate(data.weekStartDate);
    const existingReportQuery = query(
      collection(db, "reports"),
      where("userId", "==", data.userId),
      where("organizationId", "==", data.organizationId),
      where("reportType", "==", "WEEKLY"),
      where("reportPeriod.startDate", "==", weekStartTimestamp)
    );

    const existingReports = await getDocs(existingReportQuery);
    if (!existingReports.empty) {
      throw new Error("Bu hafta için zaten bir rapor gönderilmiş");
    }

    // Batch işlemi başlat
    const batch = writeBatch(db);

    // Raporu oluştur
    const reportRef = doc(collection(db, "reports"));
    const report = {
      id: reportRef.id,
      userId: data.userId,
      userName: data.userName,
      managerId: managerId, // Organizasyondan alınan yönetici ID'si
      organizationId: data.organizationId,
      content: data.content,
      status: "UNREAD",
      createdAt: Timestamp.now(),
      reportType: "WEEKLY",
      reportPeriod: {
        startDate: Timestamp.fromDate(data.weekStartDate),
        endDate: Timestamp.fromDate(data.weekEndDate),
      },
    };

    console.log("Oluşturulacak haftalık rapor verisi:", report);

    batch.set(reportRef, report);

    // Yöneticiye bildirim gönder
    const notificationRef = doc(collection(db, "notifications"));
    const notification = {
      id: notificationRef.id,
      userId: managerId, // Organizasyondan alınan yönetici ID'si
      title: "Yeni Haftalık Rapor",
      message: `${data.userName} tarafından yeni bir haftalık rapor gönderildi.`,
      type: "REPORT",
      reportId: reportRef.id,
      createdAt: Timestamp.now(),
      read: false,
    };

    batch.set(notificationRef, notification);

    // Batch işlemini uygula
    await batch.commit();

    console.log("Haftalık rapor başarıyla oluşturuldu, ID:", reportRef.id);

    return reportRef.id;
  } catch (error) {
    console.error("Haftalık rapor oluşturulurken hata:", error);
    throw error;
  }
}

// Yöneticinin haftalık raporlarını getirme
export async function getManagerWeeklyReports(managerId: string) {
  try {
    const q = query(
      collection(db, "reports"),
      where("managerId", "==", managerId),
      where("reportType", "==", "WEEKLY"),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Report[];
  } catch (error) {
    console.error("Haftalık raporlar getirilirken hata:", error);
    throw error;
  }
}

// Rapor durumunu güncelleme
export async function updateReportStatus(
  reportId: string,
  status: "READ" | "UNREAD",
  managerComment?: string
) {
  try {
    const reportRef = doc(db, "reports", reportId);
    await updateDoc(reportRef, {
      status,
      ...(managerComment && { managerComment }),
      readAt: status === "READ" ? Timestamp.now() : null,
    });
  } catch (error) {
    console.error("Rapor durumu güncellenirken hata:", error);
    throw error;
  }
}

// Kullanıcının haftalık raporlarını getirme
export async function getUserWeeklyReports(userId: string) {
  try {
    const q = query(
      collection(db, "reports"),
      where("userId", "==", userId),
      where("reportType", "==", "WEEKLY"),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Report[];
  } catch (error) {
    console.error("Haftalık raporlar getirilirken hata:", error);
    throw error;
  }
}

// Organizasyon bilgilerini getirme
export async function getOrganization(organizationId: string) {
  try {
    const orgRef = doc(db, "organizations", organizationId);
    const orgSnap = await getDoc(orgRef);

    if (!orgSnap.exists()) {
      throw new Error("Organizasyon bulunamadı");
    }

    return {
      id: orgSnap.id,
      ...orgSnap.data(),
    } as Organization;
  } catch (error) {
    console.error("Organizasyon bilgileri getirilirken hata:", error);
    throw error;
  }
}

// Organizasyon yöneticilerini kontrol et ve yönetici rolüne yükselt
export async function checkAndPromoteOrganizationManagers() {
  try {
    if (!auth.currentUser) {
      throw new Error("Bu işlem için giriş yapmanız gerekiyor");
    }

    // Kullanıcının yönetici olduğu organizasyonları getir
    const q = query(
      collection(db, "organizations"),
      where("managerId", "==", auth.currentUser.uid)
    );

    const querySnapshot = await getDocs(q);
    const organizations = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Organization[];

    // Eğer kullanıcı en az bir organizasyonun yöneticisi ise
    if (organizations.length > 0) {
      // Kullanıcıyı yönetici rolüne yükselt
      await updateUserRole(auth.currentUser.uid, "manager");
      console.log("Kullanıcı yönetici rolüne yükseltildi");
      return true;
    }

    return false;
  } catch (error) {
    console.error("Organizasyon yöneticileri kontrol edilirken hata:", error);
    return false;
  }
}
