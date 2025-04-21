"use client";

import { useState } from "react";
import { useReportStore } from "@/store/report-store";
import { useAuth } from "@/providers/auth-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { OrganizationSelector } from "./organization-selector";
import { toast } from "sonner";

interface NewReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewReportDialog({ open, onOpenChange }: NewReportDialogProps) {
  const { user } = useAuth();
  const createNewReport = useReportStore((state) => state.createNewReport);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [organizationId, setOrganizationId] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [managerId, setManagerId] = useState("");
  const [managerName, setManagerName] = useState("");

  const handleOrganizationChange = (
    orgId: string,
    orgName: string,
    mgrId: string,
    mgrName?: string
  ) => {
    setOrganizationId(orgId);
    setOrganizationName(orgName);
    setManagerId(mgrId);
    setManagerName(mgrName || "");
  };

  const handleSubmit = () => {
    if (!user) {
      toast.error("Bu işlemi gerçekleştirmek için giriş yapmalısınız");
      return;
    }

    if (!organizationId) {
      toast.error("Lütfen bir organizasyon seçin");
      return;
    }

    const userId = user.uid;
    const userName =
      user.displayName || user.email?.split("@")[0] || "İsimsiz Kullanıcı";

    createNewReport(
      userId,
      userName,
      managerId,
      organizationId,
      organizationName,
      title,
      description,
      startDate,
      endDate,
      managerName
    );

    resetForm();
    onOpenChange(false);
    toast.success("Rapor oluşturuldu");
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStartDate(new Date());
    setEndDate(new Date());
    setOrganizationId("");
    setOrganizationName("");
    setManagerId("");
    setManagerName("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Yeni Rapor Oluştur</DialogTitle>
          <DialogDescription>
            Yeni bir rapor oluşturmak için aşağıdaki bilgileri doldurun.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <OrganizationSelector
            value={organizationId}
            onValueChange={handleOrganizationChange}
          />

          <div className="grid gap-2">
            <Label htmlFor="title">Rapor Başlığı</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Haftalık Rapor"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Rapor açıklaması..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Başlangıç Tarihi</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? (
                      format(startDate, "PPP", { locale: tr })
                    ) : (
                      <span>Tarih seçin</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label>Bitiş Tarihi</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? (
                      format(endDate, "PPP", { locale: tr })
                    ) : (
                      <span>Tarih seçin</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button onClick={handleSubmit} disabled={!title || !organizationId}>
            Oluştur
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
