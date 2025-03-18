"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { z } from "zod";
import { auth } from "@/lib/firebase";
import {
  createReport,
  getUserManagers,
  UserData,
  Organization,
  getUserOrganizations,
} from "@/lib/firebase-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Form şeması
const formSchema = z.object({
  managerId: z.string({
    required_error: "Lütfen bir yönetici seçin",
  }),
  organizationId: z.string({
    required_error: "Lütfen bir organizasyon seçin",
  }),
  content: z
    .string({
      required_error: "Lütfen rapor içeriğini girin",
    })
    .min(10, {
      message: "Rapor içeriği en az 10 karakter olmalıdır",
    }),
});

// Form değerleri tipi
type FormValues = z.infer<typeof formSchema>;

export default function ReportForm() {
  const [managers, setManagers] = useState<UserData[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedManager, setSelectedManager] = useState<UserData | null>(null);
  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      managerId: "",
      organizationId: "",
      content: "",
    },
  });

  // Yöneticileri yükle
  useEffect(() => {
    const loadManagers = async () => {
      try {
        const managerList = await getUserManagers();
        setManagers(managerList);
      } catch {
        toast.error("Yöneticiler yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    loadManagers();
  }, []);

  // Organizasyonları yükle
  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        if (!auth.currentUser) return;
        const orgList = await getUserOrganizations(auth.currentUser.uid);
        setOrganizations(orgList);
      } catch {
        toast.error("Organizasyonlar yüklenirken bir hata oluştu");
      }
    };

    loadOrganizations();
  }, []);

  // Yönetici değiştiğinde
  useEffect(() => {
    const managerId = form.watch("managerId");
    if (managerId) {
      const manager = managers.find((m) => m.id === managerId);
      setSelectedManager(manager || null);
    }
  }, [form.watch("managerId"), managers]);

  // Organizasyon değiştiğinde
  useEffect(() => {
    const organizationId = form.watch("organizationId");
    if (organizationId) {
      const organization = organizations.find((o) => o.id === organizationId);
      setSelectedOrganization(organization || null);
    }
  }, [form.watch("organizationId"), organizations]);

  // Form gönderme
  const onSubmit = async (values: FormValues) => {
    try {
      if (!auth.currentUser) return;

      await createReport({
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || "İsimsiz Kullanıcı",
        managerId: values.managerId,
        managerName: selectedManager?.name || "Yönetici",
        organizationId: values.organizationId,
        content: values.content,
      });

      toast.success("Rapor başarıyla gönderildi");
      router.push("/reports");
    } catch {
      toast.error("Rapor gönderilirken bir hata oluştu");
    }
  };

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Yeni Rapor</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="organizationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organizasyon</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Organizasyon seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="managerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Yönetici</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Yönetici seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {managers.map((manager) => (
                        <SelectItem key={manager.id} value={manager.id}>
                          {manager.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rapor İçeriği</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Rapor içeriğini buraya yazın..."
                      {...field}
                    />
                  </FormControl>
                  {selectedManager && selectedOrganization && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Bu rapor <strong>{selectedOrganization.name}</strong>{" "}
                      organizasyonunda bulunan{" "}
                      <strong>{selectedManager.name}</strong> isimli yöneticiye
                      gönderilecektir.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Gönder
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
