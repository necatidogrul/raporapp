"use client";

import { useState } from "react";
import { KanbanBoard } from "./kanban-board";
import { TaskList } from "./task-list";
import { Button } from "@/components/ui/button";
import { LayoutList, Kanban, PlusIcon } from "lucide-react";
import { TaskDialog } from "./task-dialog";

type ViewMode = "list" | "kanban";

export function TaskManager() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Görevler</h1>
        <div className="flex items-center gap-4">
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              className={`flex items-center gap-2 ${
                viewMode === "list" ? "" : "hover:bg-gray-200"
              }`}
              onClick={() => setViewMode("list")}
            >
              <LayoutList className="h-4 w-4" />
              <span className="hidden sm:inline">Liste</span>
            </Button>
            <Button
              variant={viewMode === "kanban" ? "default" : "ghost"}
              size="sm"
              className={`flex items-center gap-2 ${
                viewMode === "kanban" ? "" : "hover:bg-gray-200"
              }`}
              onClick={() => setViewMode("kanban")}
            >
              <Kanban className="h-4 w-4" />
              <span className="hidden sm:inline">Kanban</span>
            </Button>
          </div>
          <Button onClick={() => setShowNewTaskDialog(true)}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Yeni Görev
          </Button>
        </div>
      </div>

      {viewMode === "kanban" ? <KanbanBoard hideHeader /> : <TaskList />}

      <TaskDialog
        mode="create"
        open={showNewTaskDialog}
        onOpenChange={setShowNewTaskDialog}
      />
    </div>
  );
}
