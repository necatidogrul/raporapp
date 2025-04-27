"use client";

import { TaskStatus } from "@/types/task";
import { useTaskStore } from "@/store/task-store";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { TaskCard } from "./task-card";
import {
  ClockIcon,
  CircleDotIcon,
  CheckCircle2Icon,
  PlusIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { TaskDialog } from "./task-dialog";

const columns: {
  id: TaskStatus;
  title: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}[] = [
  {
    id: "PENDING",
    title: "Bekleyen",
    icon: <ClockIcon className="h-4 w-4 text-amber-500" />,
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  {
    id: "IN_PROGRESS",
    title: "Devam Eden",
    icon: <CircleDotIcon className="h-4 w-4 text-blue-500" />,
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    id: "COMPLETED",
    title: "Tamamlanan",
    icon: <CheckCircle2Icon className="h-4 w-4 text-emerald-500" />,
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
];

interface KanbanBoardProps {
  hideHeader?: boolean;
}

export function KanbanBoard({ hideHeader = false }: KanbanBoardProps) {
  const tasks = useTaskStore((state) => state.tasks);
  const updateTask = useTaskStore((state) => state.updateTask);
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<TaskStatus | null>(null);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const task = tasks.find((t) => t.id === draggableId);

    if (task) {
      const newStatus = destination.droppableId as TaskStatus;
      updateTask(task.id, {
        ...task,
        status: newStatus,
        updatedAt: new Date(),
        weeklyReport: newStatus === "COMPLETED", // Tamamlanan taskları otomatik olarak rapora ekle
      });
    }
  };

  const getColumnTasks = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  const handleAddTask = (status: TaskStatus) => {
    setSelectedColumn(status);
    setShowNewTaskDialog(true);
  };

  return (
    <div className={hideHeader ? "" : "p-6"}>
      {!hideHeader && (
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Görevler</h1>
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column) => (
            <div
              key={column.id}
              className={`bg-card rounded-xl shadow-sm border overflow-hidden flex flex-col ${column.borderColor}`}
            >
              <div
                className={`font-semibold py-3 px-4 flex justify-between items-center ${column.bgColor} border-b ${column.borderColor}`}
              >
                <div className="flex items-center gap-2">
                  {column.icon}
                  <h2 className={column.color}>{column.title}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center h-6 min-w-6 rounded-full bg-white text-xs font-medium shadow-sm border">
                    {getColumnTasks(column.id).length}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-7 w-7 rounded-full hover:${column.bgColor}`}
                    onClick={() => handleAddTask(column.id)}
                  >
                    <PlusIcon className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-3 space-y-3 min-h-[60vh] transition-colors ${
                      snapshot.isDraggingOver ? column.bgColor : "bg-card"
                    }`}
                  >
                    {getColumnTasks(column.id).length === 0 &&
                      !snapshot.isDraggingOver && (
                        <div className="text-center text-sm text-muted-foreground py-8 border border-dashed rounded-lg flex flex-col items-center justify-center gap-2">
                          {column.icon}
                          <span>Henüz görev yok</span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => handleAddTask(column.id)}
                          >
                            <PlusIcon className="h-3.5 w-3.5 mr-1" />
                            Görev Ekle
                          </Button>
                        </div>
                      )}
                    {getColumnTasks(column.id).map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`${
                              snapshot.isDragging
                                ? "opacity-70 rotate-1 scale-105"
                                : ""
                            } transition-all`}
                          >
                            <TaskCard task={task} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <TaskDialog
        mode="create"
        initialStatus={selectedColumn}
        open={showNewTaskDialog}
        onOpenChange={(open) => {
          setShowNewTaskDialog(open);
          if (!open) setSelectedColumn(null);
        }}
      />
    </div>
  );
}
