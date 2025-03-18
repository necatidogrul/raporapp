"use client";

import { useState } from "react";
import { Task } from "@/types/task";
import { useTaskStore } from "@/store/task-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { format } from "date-fns";

interface TaskDialogProps {
  task?: Task;
  mode: "create" | "edit";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TaskDialog({
  task,
  mode,
  open: controlledOpen,
  onOpenChange,
}: TaskDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const addTask = useTaskStore((state) => state.addTask);
  const updateTask = useTaskStore((state) => state.updateTask);

  const isControlled =
    controlledOpen !== undefined && onOpenChange !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = isControlled ? onOpenChange : setUncontrolledOpen;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const newTask: Task = {
      id: task?.id || crypto.randomUUID(),
      userId: task?.userId || "",
      userName: task?.userName || "",
      managerId: task?.managerId || "",
      organizationId: task?.organizationId || "",
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      status: task?.status || "IN_PROGRESS",
      priority: formData.get("priority") as "LOW" | "MEDIUM" | "HIGH",
      startDate: new Date(formData.get("startDate") as string),
      endDate: new Date(formData.get("endDate") as string),
      dueDate: new Date(formData.get("endDate") as string),
      createdAt: task?.createdAt || new Date(),
      updatedAt: new Date(),
      weeklyReport: task?.weeklyReport || false,
      weekNumber: task?.weekNumber,
    };

    if (mode === "create") {
      addTask(newTask);
    } else {
      updateTask(task!.id, newTask);
    }

    setOpen(false);
  };

  const today = new Date().toISOString().split("T")[0];
  const defaultStartDate = task?.startDate
    ? format(task.startDate, "yyyy-MM-dd")
    : today;
  const defaultEndDate = task?.endDate
    ? format(task.endDate, "yyyy-MM-dd")
    : today;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          {mode === "create" ? (
            <Button>
              <PlusIcon className="w-4 h-4 mr-2" />
              Yeni Görev
            </Button>
          ) : (
            <Button variant="ghost" size="icon">
              <PlusIcon className="w-4 h-4" />
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Yeni Görev" : "Görevi Düzenle"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="text-sm font-medium">
              Başlık
            </label>
            <input
              type="text"
              id="title"
              name="title"
              defaultValue={task?.title}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="text-sm font-medium">
              Açıklama
            </label>
            <textarea
              id="description"
              name="description"
              defaultValue={task?.description}
              className="w-full px-3 py-2 border rounded-md"
              rows={3}
              required
            />
          </div>
          <div>
            <label htmlFor="priority" className="text-sm font-medium">
              Öncelik
            </label>
            <select
              id="priority"
              name="priority"
              defaultValue={task?.priority || "MEDIUM"}
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              <option value="LOW">Düşük</option>
              <option value="MEDIUM">Orta</option>
              <option value="HIGH">Yüksek</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="text-sm font-medium">
                Başlangıç Tarihi
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                defaultValue={defaultStartDate}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label htmlFor="endDate" className="text-sm font-medium">
                Bitiş Tarihi
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                defaultValue={defaultEndDate}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              İptal
            </Button>
            <Button type="submit">
              {mode === "create" ? "Oluştur" : "Güncelle"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
