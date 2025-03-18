"use client";

import { useTaskStore } from "@/store/task-store";
import { TaskCard } from "@/components/tasks/task-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskDialog } from "@/components/tasks/task-dialog";

export default function TasksPage() {
  const tasks = useTaskStore((state) => state.tasks);

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Görevler</h1>
        <TaskDialog mode="create" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        {tasks.length === 0 && (
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>Henüz görev yok</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Henüz hiç görev oluşturulmamış. &ldquo;Yeni Görev&rdquo;
                butonuna tıklayarak görev oluşturabilirsiniz.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
