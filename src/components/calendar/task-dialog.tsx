"use client";

import { Task } from "@/types/task";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

interface TaskDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const priorityColors = {
  LOW: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100",
  MEDIUM:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-100",
  HIGH: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100",
};

const priorityLabels = {
  LOW: "Düşük",
  MEDIUM: "Orta",
  HIGH: "Yüksek",
};

const statusColors = {
  IN_PROGRESS: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100",
  COMPLETED:
    "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100",
};

const statusLabels = {
  IN_PROGRESS: "Devam Ediyor",
  COMPLETED: "Tamamlandı",
};

export function TaskDialog({ task, open, onOpenChange }: TaskDialogProps) {
  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Badge
              variant="secondary"
              className={priorityColors[task.priority]}
            >
              {priorityLabels[task.priority]}
            </Badge>
            <Badge variant="secondary" className={statusColors[task.status]}>
              {statusLabels[task.status]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{task.description}</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Başlangıç:</span>
              <span>
                {format(new Date(task.startDate), "d MMMM yyyy", {
                  locale: tr,
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bitiş:</span>
              <span>
                {format(new Date(task.endDate), "d MMMM yyyy", { locale: tr })}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
