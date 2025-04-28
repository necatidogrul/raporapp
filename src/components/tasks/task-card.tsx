"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { ArrowUpCircle, CheckIcon, UndoIcon, GripIcon } from "lucide-react";
import { useState } from "react";
import { TaskDialog } from "./task-dialog";
import { useTaskStore } from "@/store/task-store";
import { Task } from "@/types/task";

interface TaskCardProps {
  task: Task;
}

const priorityColors = {
  LOW: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200",
  MEDIUM: "bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200",
  HIGH: "bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200",
};

const statusColors = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const statusIcons = {
  PENDING: <div className="h-2 w-2 bg-amber-500 rounded-full" />,
  IN_PROGRESS: <div className="h-2 w-2 bg-blue-500 rounded-full" />,
  COMPLETED: <div className="h-2 w-2 bg-emerald-500 rounded-full" />,
};

export function TaskCard({ task }: TaskCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const updateTask = useTaskStore((state) => state.updateTask);

  const handleToggleCompletion = () => {
    const newStatus = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    updateTask(task.id, {
      ...task,
      status: newStatus,
      updatedAt: new Date(),
      weeklyReport: newStatus === "COMPLETED",
    });
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800/50 shadow-sm border dark:border-gray-700 rounded-lg p-3 flex flex-col gap-2 group">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 cursor-move opacity-0 group-hover:opacity-80 transition-opacity">
              <GripIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="line-clamp-2 font-medium dark:text-gray-200">
              {task.title}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              onClick={handleToggleCompletion}
            >
              {task.status === "COMPLETED" ? (
                <UndoIcon className="h-4 w-4" />
              ) : (
                <CheckIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
          {task.description || "Açıklama yok"}
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-2">
            <Badge
              className={`${
                priorityColors[task.priority]
              } flex items-center gap-1.5`}
            >
              <ArrowUpCircle
                className={`h-3 w-3 ${
                  task.priority === "HIGH"
                    ? "text-rose-600"
                    : task.priority === "MEDIUM"
                    ? "text-amber-600"
                    : "text-emerald-600"
                }`}
              />
              {task.priority === "LOW" && "Düşük"}
              {task.priority === "MEDIUM" && "Orta"}
              {task.priority === "HIGH" && "Yüksek"}
            </Badge>
            <div
              className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${
                statusColors[task.status]
              }`}
            >
              {statusIcons[task.status]}
              <span>
                {task.status === "PENDING" && "Bekliyor"}
                {task.status === "IN_PROGRESS" && "Devam Ediyor"}
                {task.status === "COMPLETED" && "Tamamlandı"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs">
            <Calendar className="h-3.5 w-3.5 text-violet-500" />
            {format(task.endDate, "d MMM", { locale: tr })}
          </div>
        </div>
      </div>

      {showEditDialog && (
        <TaskDialog
          mode="edit"
          task={task}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
        />
      )}
    </>
  );
}
