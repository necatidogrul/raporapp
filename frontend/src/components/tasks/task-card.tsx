"use client";

import { Task } from "@/types/task";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTaskStore } from "@/store/task-store";
import {
  CheckCircle2Icon,
  CircleDotIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface TaskCardProps {
  task: Task;
}

const priorityColors = {
  LOW: "text-green-500",
  MEDIUM: "text-yellow-500",
  HIGH: "text-red-500",
};

export function TaskCard({ task }: TaskCardProps) {
  const updateTask = useTaskStore((state) => state.updateTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);

  const toggleStatus = () => {
    updateTask(task.id, {
      status: task.status === "COMPLETED" ? "IN_PROGRESS" : "COMPLETED",
    });
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="line-clamp-1">{task.title}</CardTitle>
          <span className={priorityColors[task.priority]}>
            {task.priority === "LOW" && "Düşük"}
            {task.priority === "MEDIUM" && "Orta"}
            {task.priority === "HIGH" && "Yüksek"}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {task.description}
        </p>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Başlangıç:</span>
            <span>{format(task.startDate, "d MMMM yyyy", { locale: tr })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Bitiş:</span>
            <span>{format(task.endDate, "d MMMM yyyy", { locale: tr })}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="ghost" size="icon" onClick={toggleStatus}>
          {task.status === "COMPLETED" ? (
            <CheckCircle2Icon className="h-5 w-5 text-green-500" />
          ) : (
            <CircleDotIcon className="h-5 w-5" />
          )}
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon">
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteTask(task.id)}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
