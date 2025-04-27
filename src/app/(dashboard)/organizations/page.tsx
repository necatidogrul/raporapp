"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import {
  getUserOrganizations,
  createOrganization,
  deleteOrganization,
  Organization,
  getUserData,
} from "@/lib/firebase-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Users,
  ArrowRight,
  Trash2,
  Building2,
  UsersIcon,
  UserPlusIcon,
  ShieldIcon,
  CircleCheckIcon,
  LandmarkIcon,
  NetworkIcon,
  GitMergeIcon,
  FlaskConicalIcon,
  BarChart3Icon,
  Briefcase,
  Boxes,
  Building,
  Code2,
  Database,
  Dna,
  Factory,
  Globe,
  Layers,
  LineChart,
  Rocket,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/ui/loader";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

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
  const [progressValue, setProgressValue] = useState<number>(0);
  const [selectedLogo, setSelectedLogo] = useState<string>("Building");
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

        const checkUserAndLoadData = async () => {
          try {
            await getUserData(user.uid);
          } catch (error) {
            console.error("Kullanıcı bilgileri yüklenirken hata:", error);
            toast.error("Kullanıcı bilgileri yüklenirken bir hata oluştu");
          }
        };

        checkUserAndLoadData();
      } else {
        setCurrentUserId(null);
        setOrganizations([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Yönetici olunan organizasyon oranı için progress bar
    const managedOrgs = organizations.filter(
      (org) => org.managerId === currentUserId
    );
    const managedRate =
      organizations.length > 0
        ? Math.round((managedOrgs.length / organizations.length) * 100)
        : 0;

    const timer = setTimeout(() => {
      setProgressValue(managedRate);
    }, 300);

    return () => clearTimeout(timer);
  }, [organizations, currentUserId]);

  const handleCreateOrg = async () => {
    try {
      if (!currentUserId) return;

      await createOrganization({
        name: newOrgName,
        description: newOrgDesc,
        managerId: currentUserId,
        logo: selectedLogo,
      });

      toast.success("Organizasyon oluşturuldu");
      setShowNewOrgDialog(false);
      setNewOrgName("");
      setNewOrgDesc("");
      setSelectedLogo("Building");

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

  const logoOptions = [
    { name: "Building", icon: Building, color: "indigo" },
    { name: "Landmark", icon: LandmarkIcon, color: "indigo" },
    { name: "Network", icon: NetworkIcon, color: "purple" },
    { name: "Database", icon: Database, color: "purple" },
    { name: "Dna", icon: Dna, color: "rose" },
    { name: "Factory", icon: Factory, color: "rose" },
    { name: "Globe", icon: Globe, color: "indigo" },
    { name: "Code", icon: Code2, color: "purple" },
    { name: "Chart", icon: LineChart, color: "rose" },
    { name: "Briefcase", icon: Briefcase, color: "indigo" },
    { name: "Layers", icon: Layers, color: "purple" },
    { name: "Rocket", icon: Rocket, color: "rose" },
    { name: "FlaskConical", icon: FlaskConicalIcon, color: "indigo" },
    { name: "GitMerge", icon: GitMergeIcon, color: "purple" },
    { name: "Wallet", icon: Wallet, color: "rose" },
    { name: "Boxes", icon: Boxes, color: "indigo" },
  ];

  if (loading) {
    return <Loader className="p-8" />;
  }

  // Organizasyon istatistikleri
  const totalOrgs = organizations.length;
  const managedOrgs = organizations.filter(
    (org) => org.managerId === currentUserId
  );
  const memberOnlyOrgs = organizations.filter(
    (org) => org.managerId !== currentUserId
  );
  const managedRate =
    totalOrgs > 0 ? Math.round((managedOrgs.length / totalOrgs) * 100) : 0;

  return (
    <motion.div initial="initial" animate="animate" className="p-6 space-y-8">
      {/* Üst banner */}
      <motion.div
        variants={fadeIn}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 p-8 rounded-2xl shadow-lg backdrop-blur-sm border border-violet-200/20"
      >
        <div className="space-y-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <Building2 className="h-8 w-8 text-violet-600 animate-pulse" />
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-transparent bg-clip-text">
              Organizasyonlar
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground"
          >
            Organizasyonlarınızı yönetin ve takip edin
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.02 }}
        >
          <Button
            onClick={() => setShowNewOrgDialog(true)}
            className="bg-violet-600 hover:bg-violet-700 text-white shadow-md"
          >
            <Plus className="w-4 h-4 mr-2" />
            Yeni Organizasyon
          </Button>
        </motion.div>
      </motion.div>

      {/* İstatistik kartları */}
      <motion.div
        variants={staggerContainer}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={fadeIn} whileHover={{ scale: 1.02 }}>
          <Card className="overflow-hidden border-l-4 border-l-violet-500 shadow-lg hover:shadow-xl transition-all duration-200 bg-background/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-violet-50/50 dark:bg-violet-950/20">
              <CardTitle className="text-sm font-medium">
                Toplam Organizasyon
              </CardTitle>
              <motion.div
                whileHover={{ rotate: 15 }}
                className="rounded-full bg-violet-100 p-2"
              >
                <Building2 className="h-5 w-5 text-violet-600" />
              </motion.div>
            </CardHeader>
            <CardContent className="pt-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-3xl font-bold"
              >
                {totalOrgs}
              </motion.div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <Users className="h-3 w-3 mr-1 text-violet-600" />
                Toplam organizasyon sayısı
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeIn} whileHover={{ scale: 1.02 }}>
          <Card className="overflow-hidden border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-all duration-200 bg-background/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-green-50/50 dark:bg-green-950/20">
              <CardTitle className="text-sm font-medium">Yönetilen</CardTitle>
              <motion.div
                whileHover={{ rotate: 15 }}
                className="rounded-full bg-green-100 p-2"
              >
                <ShieldIcon className="h-5 w-5 text-green-500" />
              </motion.div>
            </CardHeader>
            <CardContent className="pt-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-3xl font-bold"
              >
                {managedOrgs.length}
              </motion.div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <CircleCheckIcon className="h-3 w-3 mr-1 text-green-500" />
                Yönetici olduğunuz organizasyonlar
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeIn} whileHover={{ scale: 1.02 }}>
          <Card className="overflow-hidden border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-all duration-200 bg-background/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-blue-50/50 dark:bg-blue-950/20">
              <CardTitle className="text-sm font-medium">Üye Olunan</CardTitle>
              <motion.div
                whileHover={{ rotate: 15 }}
                className="rounded-full bg-blue-100 p-2"
              >
                <UsersIcon className="h-5 w-5 text-blue-500" />
              </motion.div>
            </CardHeader>
            <CardContent className="pt-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-3xl font-bold"
              >
                {memberOnlyOrgs.length}
              </motion.div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <UserPlusIcon className="h-3 w-3 mr-1 text-blue-500" />
                Üye olduğunuz organizasyonlar
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeIn} whileHover={{ scale: 1.02 }}>
          <Card className="overflow-hidden border-l-4 border-l-amber-500 shadow-lg hover:shadow-xl transition-all duration-200 bg-background/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-amber-50/50 dark:bg-amber-950/20">
              <CardTitle className="text-sm font-medium">
                Yönetim Oranı
              </CardTitle>
              <motion.div
                whileHover={{ rotate: 15 }}
                className="rounded-full bg-amber-100 p-2"
              >
                <BarChart3Icon className="h-5 w-5 text-amber-500" />
              </motion.div>
            </CardHeader>
            <CardContent className="pt-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2"
              >
                <div className="text-3xl font-bold">{managedRate}%</div>
              </motion.div>
              <div className="mt-2">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Progress value={progressValue} className="h-2" />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Organizasyon listesi */}
      <motion.div
        variants={fadeIn}
        className="bg-background/80 backdrop-blur-sm rounded-2xl border shadow-lg p-8"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <h2 className="text-xl font-semibold flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-transparent bg-clip-text">
            <NetworkIcon className="h-5 w-5 text-violet-600" />
            Organizasyonlarınız
          </h2>

          <motion.div whileHover={{ scale: 1.02 }}>
            <Button
              onClick={() => setShowNewOrgDialog(true)}
              variant="outline"
              className="border-violet-200 hover:border-violet-300 hover:bg-violet-50 shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2 text-violet-600" />
              Yeni Organizasyon
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence>
            {organizations.map((org, index) => {
              const logoObj = logoOptions.find((l) => l.name === org.logo) ||
                logoOptions.find((l) => l.name === "Building") || {
                  name: "Building",
                  icon: Building,
                  color: "indigo",
                };
              const LogoIcon = logoObj.icon;

              return (
                <motion.div
                  key={org.id}
                  variants={fadeIn}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="group"
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 bg-background/80 backdrop-blur-sm">
                    <CardHeader className="space-y-1">
                      <div className="flex items-center justify-between">
                        <motion.div
                          whileHover={{ rotate: 15 }}
                          className={`rounded-lg bg-${logoObj.color}-100 p-2`}
                        >
                          <LogoIcon
                            className={`h-5 w-5 text-${logoObj.color}-600`}
                          />
                        </motion.div>
                        {org.managerId === currentUserId && (
                          <Badge
                            variant="secondary"
                            className="bg-violet-100 text-violet-700"
                          >
                            Yönetici
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg font-semibold group-hover:text-violet-600 transition-colors">
                        {org.name}
                      </CardTitle>
                      {org.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {org.description}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{org.members?.length || 1} üye</span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewOrgDetails(org.id)}
                        className="hover:bg-violet-50 hover:text-violet-600"
                      >
                        Detaylar
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      {org.managerId === currentUserId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setOrganizationToDelete(org);
                            setShowDeleteDialog(true);
                          }}
                          className="hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Yeni organizasyon oluşturma dialog'u */}
      <Dialog open={showNewOrgDialog} onOpenChange={setShowNewOrgDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Yeni Organizasyon Oluştur</DialogTitle>
            <DialogDescription>
              Yeni bir organizasyon oluşturmak için aşağıdaki bilgileri
              doldurun.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organizasyon Adı</Label>
              <Input
                id="name"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                placeholder="Organizasyon adını girin"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={newOrgDesc}
                onChange={(e) => setNewOrgDesc(e.target.value)}
                placeholder="Organizasyon açıklamasını girin"
              />
            </div>
            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="grid grid-cols-4 gap-2">
                {logoOptions.map((logo) => {
                  const Icon = logo.icon;
                  return (
                    <Button
                      key={logo.name}
                      type="button"
                      variant={
                        selectedLogo === logo.name ? "default" : "outline"
                      }
                      className={`p-2 aspect-square ${
                        selectedLogo === logo.name
                          ? "bg-violet-600 hover:bg-violet-700"
                          : "hover:bg-violet-50"
                      }`}
                      onClick={() => setSelectedLogo(logo.name)}
                    >
                      <Icon className="h-5 w-5" />
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewOrgDialog(false)}
            >
              İptal
            </Button>
            <Button
              onClick={handleCreateOrg}
              disabled={!newOrgName.trim()}
              className="bg-violet-600 hover:bg-violet-700"
            >
              Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Silme onay dialog'u */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Organizasyonu Sil</DialogTitle>
            <DialogDescription>
              Bu organizasyonu silmek istediğinizden emin misiniz? Bu işlem geri
              alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setOrganizationToDelete(null);
              }}
            >
              İptal
            </Button>
            <Button variant="destructive" onClick={handleDeleteOrg}>
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
