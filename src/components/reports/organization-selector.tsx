"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { getUserOrganizations, getUserData } from "@/lib/firebase-utils";
import { Organization } from "@/lib/firebase-utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface OrganizationSelectorProps {
  value: string;
  onValueChange: (
    value: string,
    organizationName: string,
    managerId: string,
    managerName?: string
  ) => void;
}

export function OrganizationSelector({
  value,
  onValueChange,
}: OrganizationSelectorProps) {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrganizations = async () => {
      if (!user) return;

      try {
        const orgList = await getUserOrganizations(user.uid);
        setOrganizations(orgList);

        // Eğer bir organizasyon varsa ve değer seçilmemişse ilk organizasyonu seç
        if (orgList.length > 0 && !value) {
          // Yönetici bilgilerini getir
          const manager = await getUserData(orgList[0].managerId);
          onValueChange(
            orgList[0].id,
            orgList[0].name,
            orgList[0].managerId,
            manager?.name
          );
        }
      } catch (error) {
        console.error("Organizasyonlar yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    loadOrganizations();
  }, [user, value, onValueChange]);

  const handleChange = async (orgId: string) => {
    const selectedOrg = organizations.find((org) => org.id === orgId);
    if (selectedOrg) {
      try {
        // Yönetici bilgilerini getir
        const manager = await getUserData(selectedOrg.managerId);
        onValueChange(
          selectedOrg.id,
          selectedOrg.name,
          selectedOrg.managerId,
          manager?.name
        );
      } catch (error) {
        console.error("Yönetici bilgileri getirilirken hata:", error);
        onValueChange(selectedOrg.id, selectedOrg.name, selectedOrg.managerId);
      }
    }
  };

  if (loading) {
    return <div>Organizasyonlar yükleniyor...</div>;
  }

  if (organizations.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        Henüz bir organizasyona üye değilsiniz. Rapor göndermek için bir
        organizasyona katılmanız gerekiyor.
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor="organization">Organizasyon</Label>
      <Select value={value} onValueChange={handleChange}>
        <SelectTrigger id="organization">
          <SelectValue placeholder="Organizasyon seçin" />
        </SelectTrigger>
        <SelectContent>
          {organizations.map((org) => (
            <SelectItem key={org.id} value={org.id}>
              {org.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
