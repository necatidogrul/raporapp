"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import {
  Invitation,
  getPendingInvitations,
  acceptInvitation,
  rejectInvitation,
} from "@/lib/firebase-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Mail, Sparkles, UserPlus, Clock, Building2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Loader } from "@/components/ui/loader";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

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

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      if (auth.currentUser) {
        const invitationList = await getPendingInvitations(auth.currentUser.uid);
        setInvitations(invitationList);
      }
    } catch {
      toast.error("Davetiyeler yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (invitationId: string) => {
    try {
      await acceptInvitation(invitationId);
      toast.success("Davetiye kabul edildi");
      loadInvitations();
    } catch {
      toast.error("Davetiye kabul edilirken bir hata oluştu");
    }
  };

  const handleReject = async (invitationId: string) => {
    try {
      await rejectInvitation(invitationId);
      toast.success("Davetiye reddedildi");
      loadInvitations();
    } catch {
      toast.error("Davetiye reddedilirken bir hata oluştu");
    }
  };

  if (loading) {
    return <Loader className="p-8" />;
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      className="p-6 space-y-8"
    >
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
            <Mail className="h-8 w-8 text-violet-600 animate-pulse" />
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-transparent bg-clip-text">
              Davetiyeler
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground"
          >
            Organizasyon davetiyelerinizi yönetin
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <Badge variant="secondary" className="bg-violet-100 text-violet-700 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            {invitations.length} Bekleyen Davetiye
          </Badge>
        </motion.div>
      </motion.div>

      {/* Davetiye listesi */}
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
            <UserPlus className="h-5 w-5 text-violet-600" />
            Bekleyen Davetiyeler
          </h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          className="grid gap-6"
        >
          <AnimatePresence>
            {invitations.length === 0 ? (
              <motion.div
                variants={fadeIn}
                className="flex flex-col items-center justify-center py-12 text-center space-y-4"
              >
                <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center">
                  <Mail className="h-10 w-10 text-violet-600" />
                </div>
                <h3 className="text-lg font-medium">Bekleyen Davetiye Yok</h3>
                <p className="text-muted-foreground max-w-sm">
                  Şu anda bekleyen davetiyeniz bulunmuyor. Yeni davetiyeler geldiğinde burada görüntülenecek.
                </p>
              </motion.div>
            ) : (
              invitations.map((invitation, index) => (
                <motion.div
                  key={invitation.id}
                  variants={fadeIn}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 bg-background/80 backdrop-blur-sm border-violet-200/50">
                    <CardHeader className="space-y-1">
                      <div className="flex items-center justify-between">
                        <motion.div
                          whileHover={{ rotate: 15 }}
                          className="rounded-lg bg-violet-100 p-2"
                        >
                          <Building2 className="h-5 w-5 text-violet-600" />
                        </motion.div>
                        <Badge variant="outline" className="border-violet-200 text-violet-700">
                          Yeni Davetiye
                        </Badge>
                      </div>
                      <CardTitle className="text-lg font-semibold group-hover:text-violet-600 transition-colors">
                        {invitation.organizationName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <UserPlus className="h-4 w-4 text-violet-600" />
                          <span>{invitation.managerName} sizi organizasyona davet etti</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {format(invitation.createdAt.toDate(), "dd MMMM yyyy HH:mm", {
                              locale: tr,
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleAccept(invitation.id)}
                          className="w-full bg-violet-600 hover:bg-violet-700 text-white shadow-md"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Kabul Et
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(invitation.id)}
                          className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reddet
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
