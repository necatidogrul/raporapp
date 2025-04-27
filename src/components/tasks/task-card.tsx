"use client";

import { Task, TaskPriority } from "@/types/task";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { useTaskStore } from "@/store/task-store";
import {
  CalendarIcon,
  CheckIcon,
  CircleDotIcon,
  ClockIcon,
  EditIcon,
  GripIcon,
  MoreHorizontalIcon,
  TagIcon,
  TrashIcon,
} from "lucide-react";
import { useState } from "react";
import { TaskDialog } from "./task-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const priorityConfig = {
  LOW: {
    label: "Düşük",
    color: "text-slate-500 bg-slate-50 border-slate-200",
    icon: <CircleDotIcon className="h-3 w-3" />,
  },
  MEDIUM: {
    label: "Orta",
    color: "text-blue-500 bg-blue-50 border-blue-200",
    icon: <CircleDotIcon className="h-3 w-3" />,
  },
  HIGH: {
    label: "Yüksek",
    color: "text-amber-500 bg-amber-50 border-amber-200",
    icon: <CircleDotIcon className="h-3 w-3" />,
  },
  URGENT: {
    label: "Acil",
    color: "text-red-500 bg-red-50 border-red-200",
    icon: <CircleDotIcon className="h-3 w-3" />,
  },
};

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleToggleCompletion = () => {
    const newStatus = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    updateTask(task.id, {
      ...task,
      status: newStatus,
      updatedAt: new Date(),
      weeklyReport: newStatus === "COMPLETED", // Tamamlanan görevleri otomatik olarak rapor et
    });
  };

  return (
    <>
      <div className="bg-white shadow-sm border rounded-lg p-3 flex flex-col gap-2 group">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 cursor-move opacity-0 group-hover:opacity-80 transition-opacity">
              <GripIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="line-clamp-2 font-medium">{task.title}</div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                <EditIcon className="h-4 w-4 mr-2" />
                <span>Düzenle</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => deleteTask(task.id)}
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                <span>Sil</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-wrap gap-2 mt-1">
          <span
            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${
              priorityConfig[task.priority].color
            }`}
          >
            {priorityConfig[task.priority].icon}
            {priorityConfig[task.priority].label}
          </span>

          {task.tags && task.tags.length > 0 && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full text-purple-500 bg-purple-50 border border-purple-200">
              <TagIcon className="h-3 w-3" />
              {task.tags[0]}
              {task.tags.length > 1 && <span>+{task.tags.length - 1}</span>}
            </span>
          )}
        </div>

        {task.dueDate && (
          <div className="mt-1 flex items-center text-xs gap-1 text-muted-foreground">
            <CalendarIcon className="h-3 w-3" />
            <span>
              {new Date(task.dueDate).toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "long",
              })}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between mt-1 pt-2 border-t">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <ClockIcon className="h-3 w-3" />
            {formatDistanceToNow(new Date(task.createdAt), {
              addSuffix: true,
              locale: tr,
            })}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6 rounded-full"
            onClick={handleToggleCompletion}
          >
            {task.status === "COMPLETED" ? (
              <CheckIcon className="h-3 w-3 text-green-500" />
            ) : (
              <div className="h-3 w-3 rounded-full border-2 border-muted-foreground" />
            )}
          </Button>
        </div>
      </div>

      <TaskDialog
        task={task}
        mode="edit"
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
    </>
  );
}
