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
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      if (auth.currentUser) {
        const invitationList = await getPendingInvitations(
          auth.currentUser.uid
        );
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
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Davetiyeler</h1>
      <div className="grid gap-4">
        {invitations.length === 0 ? (
          <p>Bekleyen davetiye bulunmuyor.</p>
        ) : (
          invitations.map((invitation) => (
            <Card key={invitation.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {invitation.organizationName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {invitation.managerName} sizi organizasyona davet etti
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(
                        invitation.createdAt.toDate(),
                        "dd MMMM yyyy HH:mm",
                        {
                          locale: tr,
                        }
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleAccept(invitation.id)}
                      className="w-full"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Kabul Et
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleReject(invitation.id)}
                      className="w-full"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reddet
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
