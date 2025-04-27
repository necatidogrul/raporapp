"use client";

import { useTaskStore } from "@/store/task-store";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import {
  CheckCircle2Icon,
  CircleDotIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
  Calendar,
  ArrowUpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskStatus } from "@/types/task";
import { useState } from "react";
import { TaskDialog } from "./task-dialog";

const priorityColors = {
  LOW: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200",
  MEDIUM: "bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200",
  HIGH: "bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200",
};

const statusIcons = {
  PENDING: <ClockIcon className="h-4 w-4 text-amber-500" />,
  IN_PROGRESS: <CircleDotIcon className="h-4 w-4 text-blue-500" />,
  COMPLETED: <CheckCircle2Icon className="h-4 w-4 text-emerald-500" />,
};

const statusColors = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function TaskList() {
  const tasks = useTaskStore((state) => state.tasks);
  const updateTask = useTaskStore((state) => state.updateTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const [taskToEdit, setTaskToEdit] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const selectedTask = tasks.find((task) => task.id === taskToEdit);

  const toggleStatus = (taskId: string, currentStatus: TaskStatus) => {
    const newStatus: TaskStatus =
      currentStatus === "COMPLETED"
        ? "IN_PROGRESS"
        : currentStatus === "IN_PROGRESS"
        ? "COMPLETED"
        : "IN_PROGRESS";

    updateTask(taskId, {
      status: newStatus,
      updatedAt: new Date(),
      weeklyReport: newStatus === "COMPLETED",
    });
  };

  const handleEditTask = (taskId: string) => {
    setTaskToEdit(taskId);
    setShowEditDialog(true);
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-dashed">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-violet-100 flex items-center justify-center">
            <ClockIcon className="h-6 w-6 text-violet-600" />
          </div>
          <h3 className="text-lg font-medium">Henüz görev eklenmemiş</h3>
          <p className="text-muted-foreground text-sm">
            &quot;Yeni Görev&quot; butonuna tıklayarak yeni görev
            ekleyebilirsiniz
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50">
              <th className="py-3 px-4 text-left font-medium text-slate-500 dark:text-slate-400 text-sm">
                Durum
              </th>
              <th className="py-3 px-4 text-left font-medium text-slate-500 dark:text-slate-400 text-sm">
                Başlık
              </th>
              <th className="py-3 px-4 text-left font-medium text-slate-500 dark:text-slate-400 text-sm">
                Öncelik
              </th>
              <th className="py-3 px-4 text-left font-medium text-slate-500 dark:text-slate-400 text-sm">
                Başlangıç
              </th>
              <th className="py-3 px-4 text-left font-medium text-slate-500 dark:text-slate-400 text-sm">
                Bitiş
              </th>
              <th className="py-3 px-4 text-center font-medium text-slate-500 dark:text-slate-400 text-sm">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {tasks.map((task) => (
              <tr
                key={task.id}
                className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group"
              >
                <td className="py-3 px-4">
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
                </td>
                <td className="py-3 px-4">
                  <div className="font-medium">{task.title}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {task.description || "Açıklama yok"}
                  </div>
                </td>
                <td className="py-3 px-4">
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
                </td>
                <td className="py-3 px-4 text-sm">
                  <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                    <Calendar className="h-3.5 w-3.5 text-violet-500" />
                    {format(task.startDate, "d MMM yyyy", { locale: tr })}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm">
                  <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                    <Calendar className="h-3.5 w-3.5 text-violet-500" />
                    {format(task.endDate, "d MMM yyyy", { locale: tr })}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-60 group-hover:opacity-100 text-slate-600 hover:text-violet-700 hover:bg-violet-50"
                      onClick={() => handleEditTask(task.id)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-60 group-hover:opacity-100 text-slate-600 hover:text-rose-700 hover:bg-rose-50"
                      onClick={() => deleteTask(task.id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 opacity-60 group-hover:opacity-100 ${
                        task.status === "COMPLETED"
                          ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          : "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      }`}
                      onClick={() => toggleStatus(task.id, task.status)}
                    >
                      {task.status === "COMPLETED" ? (
                        <CheckCircle2Icon className="h-4 w-4" />
                      ) : (
                        <CircleDotIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {taskToEdit && (
        <TaskDialog
          mode="edit"
          task={selectedTask}
          open={showEditDialog}
          onOpenChange={(open) => {
            setShowEditDialog(open);
            if (!open) setTaskToEdit(null);
          }}
        />
      )}
    </>
  );
}
