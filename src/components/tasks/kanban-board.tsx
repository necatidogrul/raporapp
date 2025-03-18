"use client";

import { useState } from "react";
import { Task, TaskStatus } from "@/types/task";
import { useTaskStore } from "@/store/task-store";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { TaskCard } from "./task-card";
import { PlusIcon } from "lucide-react";

const columns: { id: TaskStatus; title: string }[] = [
  { id: "PENDING", title: "Bekleyen" },
  { id: "IN_PROGRESS", title: "Devam Eden" },
  { id: "COMPLETED", title: "Tamamlanan" },
];

interface KanbanBoardProps {
  hideHeader?: boolean;
}

export function KanbanBoard({ hideHeader = false }: KanbanBoardProps) {
  const tasks = useTaskStore((state) => state.tasks);
  const updateTask = useTaskStore((state) => state.updateTask);

  const handleDragEnd = (result: any) => {
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

  return (
    <div className={hideHeader ? "" : "p-6"}>
      {!hideHeader && (
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Görevler</h1>
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map((column) => (
            <div key={column.id} className="bg-card rounded-lg shadow p-4">
              <h2 className="font-semibold mb-4 flex justify-between items-center">
                {column.title}
                <span className="text-sm text-muted-foreground">
                  {getColumnTasks(column.id).length}
                </span>
              </h2>

              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-2 min-h-[200px]"
                  >
                    {getColumnTasks(column.id).map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
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
    </div>
  );
}
