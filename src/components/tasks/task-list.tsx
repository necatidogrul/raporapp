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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskStatus } from "@/types/task";

const priorityColors = {
  LOW: "bg-green-100 text-green-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-red-100 text-red-800",
};

const statusIcons = {
  PENDING: <ClockIcon className="h-4 w-4 text-yellow-500" />,
  IN_PROGRESS: <CircleDotIcon className="h-4 w-4 text-blue-500" />,
  COMPLETED: <CheckCircle2Icon className="h-4 w-4 text-green-500" />,
};

export function TaskList() {
  const tasks = useTaskStore((state) => state.tasks);
  const updateTask = useTaskStore((state) => state.updateTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);

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

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Henüz görev eklenmemiş
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="py-3 px-4 text-left font-medium text-gray-500 text-sm">
              Durum
            </th>
            <th className="py-3 px-4 text-left font-medium text-gray-500 text-sm">
              Başlık
            </th>
            <th className="py-3 px-4 text-left font-medium text-gray-500 text-sm">
              Öncelik
            </th>
            <th className="py-3 px-4 text-left font-medium text-gray-500 text-sm">
              Başlangıç
            </th>
            <th className="py-3 px-4 text-left font-medium text-gray-500 text-sm">
              Bitiş
            </th>
            <th className="py-3 px-4 text-left font-medium text-gray-500 text-sm">
              İşlemler
            </th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr
              key={task.id}
              className="border-b hover:bg-gray-50 transition-colors"
            >
              <td className="py-3 px-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => toggleStatus(task.id, task.status)}
                >
                  {statusIcons[task.status]}
                </Button>
              </td>
              <td className="py-3 px-4">
                <div className="font-medium">{task.title}</div>
                <div className="text-sm text-gray-500 line-clamp-1">
                  {task.description}
                </div>
              </td>
              <td className="py-3 px-4">
                <Badge className={priorityColors[task.priority]}>
                  {task.priority === "LOW" && "Düşük"}
                  {task.priority === "MEDIUM" && "Orta"}
                  {task.priority === "HIGH" && "Yüksek"}
                </Badge>
              </td>
              <td className="py-3 px-4 text-sm">
                {format(task.startDate, "d MMM yyyy", { locale: tr })}
              </td>
              <td className="py-3 px-4 text-sm">
                {format(task.endDate, "d MMM yyyy", { locale: tr })}
              </td>
              <td className="py-3 px-4">
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => deleteTask(task.id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
