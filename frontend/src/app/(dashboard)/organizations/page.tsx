"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import {
  getUserOrganizations,
  createOrganization,
  deleteOrganization,
  Organization,
} from "@/lib/firebase-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Users, ArrowRight, Trash2, Building2 } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgDesc, setNewOrgDesc] = useState("");
  const [showNewOrgDialog, setShowNewOrgDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [organizationToDelete, setOrganizationToDelete] =
    useState<Organization | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const router = useRouter();

  const loadOrganizations = async (userId: string) => {
    try {
      const orgList = await getUserOrganizations(userId);
      setOrganizations(orgList);
    } catch (error) {
      console.error("Organizasyonlar yüklenirken hata:", error);
      toast.error("Organizasyonlar yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserId(user.uid);
        loadOrganizations(user.uid);
      } else {
        setCurrentUserId(null);
        setOrganizations([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleCreateOrg = async () => {
    try {
      if (!currentUserId) return;

      await createOrganization({
        name: newOrgName,
        description: newOrgDesc,
        managerId: currentUserId,
      });

      toast.success("Organizasyon oluşturuldu");
      setShowNewOrgDialog(false);
      setNewOrgName("");
      setNewOrgDesc("");

      // Organizasyonları yeniden yükle
      loadOrganizations(currentUserId);

      // Sayfayı yenile (kullanıcı rolünün güncellenmesi için)
      window.location.reload();
    } catch {
      toast.error("Organizasyon oluşturulurken bir hata oluştu");
    }
  };

  const handleViewOrgDetails = (orgId: string) => {
    router.push(`/organizations/${orgId}`);
  };

  const handleDeleteOrg = async () => {
    try {
      if (!organizationToDelete || !currentUserId) return;

      await deleteOrganization(organizationToDelete.id);
      toast.success("Organizasyon silindi");
      setShowDeleteDialog(false);
      setOrganizationToDelete(null);
      loadOrganizations(currentUserId);
    } catch (error) {
      let errorMessage = "Organizasyon silinirken bir hata oluştu";

      if (error instanceof Error) {
        if (error.message === "Bu işlem için yetkiniz yok") {
          errorMessage = "Bu organizasyonu silme yetkiniz yok";
        } else if (error.message === "Organizasyon bulunamadı") {
          errorMessage = "Organizasyon bulunamadı";
        }
      }

      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="container py-12 px-4 md:px-8">
        <div className="flex flex-col items-center justify-center space-y-4 min-h-[60vh]">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Organizasyonlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4 md:px-8 space-y-8">
      {/* Başlık ve Yeni Organizasyon Butonu */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Organizasyonlarım
          </h1>
          <p className="text-muted-foreground mt-1">
            Yönettiğiniz ve üyesi olduğunuz organizasyonlar
          </p>
        </div>
        <Button
          onClick={() => setShowNewOrgDialog(true)}
          className="bg-primary hover:bg-primary/90 transition-all"
          size="lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Yeni Organizasyon
        </Button>
      </div>

      {/* Organizasyon Listesi */}
      {organizations.length === 0 ? (
        <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
          <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-medium">Henüz organizasyonunuz yok</h2>
          <p className="text-muted-foreground max-w-md">
            Yeni bir organizasyon oluşturarak takımınızı yönetmeye başlayın veya
            bir davetiye bekleyin.
          </p>
          <Button
            onClick={() => setShowNewOrgDialog(true)}
            className="mt-2"
            size="lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Organizasyon Oluştur
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => (
            <Card
              key={org.id}
              className="overflow-hidden hover:shadow-lg transition-all border-muted/40 hover:border-primary/30"
            >
              <div className="h-2 bg-gradient-to-r from-primary to-primary/60"></div>
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center">
                  <span>{org.name}</span>
                  <div className="flex items-center gap-2">
                    {currentUserId === org.managerId ? (
                      <>
                        <Badge className="bg-primary hover:bg-primary">
                          Yönetici
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOrganizationToDelete(org);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Badge variant="secondary">Üye</Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent
                className="cursor-pointer pt-2"
                onClick={() => handleViewOrgDetails(org.id)}
              >
                <p className="text-sm text-muted-foreground mb-6 min-h-[40px]">
                  {org.description || "Açıklama yok"}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{org.members?.length || 1} üye</span>
                  </div>
                  <Badge
                    variant={
                      currentUserId === org.managerId ? "default" : "secondary"
                    }
                  >
                    {currentUserId === org.managerId ? "Yönetici" : "Üye"}
                  </Badge>
                </div>
              </CardContent>
              <div className="px-6 py-4 bg-muted/10 border-t flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-primary hover:text-primary hover:bg-primary/10"
                  onClick={(e) => {
                    e.stopPropagation(); // Kart tıklamasını engelle
                    handleViewOrgDetails(org.id);
                  }}
                >
                  Detayları Görüntüle
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Yeni Organizasyon Dialog */}
      <Dialog open={showNewOrgDialog} onOpenChange={setShowNewOrgDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Yeni Organizasyon</DialogTitle>
            <DialogDescription>
              Yeni bir organizasyon oluşturarak takımınızı yönetmeye başlayın.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Organizasyon Adı</Label>
              <Input
                id="name"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                placeholder="Organizasyon adını girin"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={newOrgDesc}
                onChange={(e) => setNewOrgDesc(e.target.value)}
                placeholder="Organizasyon açıklamasını girin"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewOrgDialog(false)}
            >
              İptal
            </Button>
            <Button onClick={handleCreateOrg}>Oluştur</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Silme Onay Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-destructive">
              Organizasyonu Sil
            </DialogTitle>
            <DialogDescription className="mt-2">
              <span className="font-medium">{organizationToDelete?.name}</span>{" "}
              organizasyonunu silmek istediğinizden emin misiniz? Bu işlem geri
              alınamaz ve tüm üyelerin erişimi kaldırılacaktır.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-destructive/5 p-4 rounded-lg border border-destructive/20 mt-2">
            <div className="flex items-start gap-3">
              <Trash2 className="h-5 w-5 text-destructive mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-destructive">
                  Dikkat: Bu işlem geri alınamaz
                </p>
                <p className="text-muted-foreground mt-1">
                  Organizasyon silindikten sonra tüm veriler kalıcı olarak
                  silinecek ve kurtarılamayacaktır.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              İptal
            </Button>
            <Button variant="destructive" onClick={handleDeleteOrg}>
              Organizasyonu Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
