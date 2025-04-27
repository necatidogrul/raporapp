"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTaskStore } from "@/store/task-store";
import { Task, TaskPriority, TaskStatus } from "@/types/task";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
  status?: TaskStatus;
  mode?: "create" | "edit";
}

export function TaskDialog({
  open,
  onOpenChange,
  task,
  status = "PENDING",
  mode = "create",
}: TaskDialogProps) {
  const addTask = useTaskStore((state) => state.addTask);
  const updateTask = useTaskStore((state) => state.updateTask);

  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [priority, setPriority] = useState<TaskPriority>(
    task?.priority || "MEDIUM"
  );
  const [dueDate, setDueDate] = useState<Date>(
    task?.dueDate ? new Date(task.dueDate) : new Date()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    const now = new Date();

    if (mode === "create") {
      addTask({
        id: uuidv4(),
        title,
        description,
        status: status,
        priority,
        dueDate: dueDate,
        createdAt: now,
        updatedAt: now,
        userId: "", // Bu değerleri nereden alacağımızı belirlemeliyiz
        userName: "",
        managerId: "",
        organizationId: "",
        startDate: now,
        endDate: dueDate,
      });
    } else if (task) {
      updateTask(task.id, {
        title,
        description,
        priority,
        dueDate,
        updatedAt: now,
      });
    }

    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    if (mode === "create") {
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setDueDate(new Date());
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Yeni Görev Oluştur" : "Görevi Düzenle"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="title">Başlık</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Görev başlığı"
              autoFocus
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Görev açıklaması"
              className="min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Öncelik</Label>
              <RadioGroup
                value={priority}
                onValueChange={(value) => setPriority(value as TaskPriority)}
                className="grid grid-cols-1 gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="LOW" id="r1" />
                  <Label htmlFor="r1" className="text-sm font-normal">
                    Düşük
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="MEDIUM" id="r2" />
                  <Label htmlFor="r2" className="text-sm font-normal">
                    Orta
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="HIGH" id="r3" />
                  <Label htmlFor="r3" className="text-sm font-normal">
                    Yüksek
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Bitiş Tarihi</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? (
                      format(dueDate, "PPP", { locale: tr })
                    ) : (
                      <span>Tarih seç</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={(date) => date && setDueDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              İptal
            </Button>
            <Button type="submit">
              {mode === "create" ? "Oluştur" : "Kaydet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
