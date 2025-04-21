"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskSchema, type TaskFormValues } from "@/lib/schemas";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTaskStore } from "@/store/task-store";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Organization } from "@/lib/firebase-utils";
import { TaskStatus } from "@/types/task";
import { useEffect, useState } from "react";
import { getUserOrganizations } from "@/lib/firebase-utils";

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskForm({ open, onOpenChange }: TaskFormProps) {
  const addTask = useTaskStore((state) => state.addTask);
  const { user } = useAuth();
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  const getCurrentWeekNumber = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.ceil(diff / oneWeek);
  };

  useEffect(() => {
    const loadOrganizations = async () => {
      if (user) {
        try {
          const orgs = await getUserOrganizations(user.uid);
          setOrganizations(orgs);
        } catch (error) {
          console.error("Organizasyonlar yüklenirken hata:", error);
          toast.error("Organizasyonlar yüklenirken bir hata oluştu");
        }
      }
    };

    loadOrganizations();
  }, [user]);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      organizationId: "",
      status: "IN_PROGRESS" as TaskStatus,
      priority: "MEDIUM",
      weeklyReport: false,
      weekNumber: getCurrentWeekNumber(),
    },
  });

  const onSubmit = async (data: TaskFormValues) => {
    try {
      if (!user) return;

      // Seçilen organizasyonu bul
      const selectedOrg = organizations.find(
        (org) => org.id === data.organizationId
      );
      if (!selectedOrg) {
        toast.error("Lütfen bir organizasyon seçin");
        return;
      }

      await addTask({
        id: uuidv4(),
        userId: user.uid,
        userName: user.displayName || "İsimsiz Kullanıcı",
        managerId: selectedOrg.managerId,
        organizationId: data.organizationId,
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        dueDate: data.endDate,
        status: data.status,
        priority: data.priority,
        createdAt: new Date(),
        updatedAt: new Date(),
        weeklyReport: data.weeklyReport,
        weekNumber: getCurrentWeekNumber(),
      });

      toast.success("Görev başarıyla oluşturuldu");
      router.push("/tasks");
    } catch (error: unknown) {
      console.error("Görev oluşturulurken hata:", error);
      toast.error("Görev oluşturulurken bir hata oluştu");
    }
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yeni Task Ekle</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title">Başlık</label>
            <Input id="title" {...form.register("title")} />
            {form.formState.errors.title && (
              <p className="text-sm text-red-500">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="description">Açıklama</label>
            <Textarea id="description" {...form.register("description")} />
            {form.formState.errors.description && (
              <p className="text-sm text-red-500">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label>Organizasyon</label>
            <Select
              onValueChange={(value) => form.setValue("organizationId", value)}
              value={form.getValues("organizationId")}
            >
              <SelectTrigger>
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
            {form.formState.errors.organizationId && (
              <p className="text-sm text-red-500">
                {form.formState.errors.organizationId.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="startDate">Başlangıç Tarihi</label>
              <Input
                id="startDate"
                type="date"
                {...form.register("startDate", { valueAsDate: true })}
              />
              {form.formState.errors.startDate && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.startDate.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="endDate">Bitiş Tarihi</label>
              <Input
                id="endDate"
                type="date"
                {...form.register("endDate", { valueAsDate: true })}
              />
              {form.formState.errors.endDate && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.endDate.message}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label>Durum</label>
              <Select
                onValueChange={(value: TaskStatus) =>
                  form.setValue("status", value)
                }
                defaultValue={form.getValues("status")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Durum seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IN_PROGRESS">Devam Ediyor</SelectItem>
                  <SelectItem value="COMPLETED">Tamamlandı</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label>Öncelik</label>
              <Select
                onValueChange={(value: "LOW" | "MEDIUM" | "HIGH") =>
                  form.setValue("priority", value)
                }
                defaultValue={form.getValues("priority")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Öncelik seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Düşük</SelectItem>
                  <SelectItem value="MEDIUM">Orta</SelectItem>
                  <SelectItem value="HIGH">Yüksek</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="weeklyReport"
                {...form.register("weeklyReport")}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="weeklyReport">
                Bu taskı haftalık rapora ekle
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              İptal
            </Button>
            <Button type="submit">Kaydet</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
