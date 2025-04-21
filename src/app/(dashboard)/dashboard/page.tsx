"use client";

import { useEffect, useState } from "react";
import { useTaskStore } from "@/store/task-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskCard } from "@/components/tasks/task-card";
import {
  CheckCircle2Icon,
  CircleDotIcon,
  ClockIcon,
  ListTodoIcon,
  UserIcon,
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { getUserData } from "@/lib/firebase-utils";

export default function DashboardPage() {
  const tasks = useTaskStore((state) => state.tasks);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userData = await getUserData(auth.currentUser.uid);
        if (userData) {
          setUserName(userData.name);
        }
      }
    };

    fetchUserData();
  }, []);

  const completedTasks = tasks.filter((task) => task.status === "COMPLETED");
  const inProgressTasks = tasks.filter((task) => task.status === "IN_PROGRESS");
  const recentTasks = [...tasks]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 3);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Hoş Geldiniz</h1>
        {userName && (
          <div className="flex items-center gap-2 text-sm bg-primary/10 py-2 px-4 rounded-full">
            <UserIcon className="h-4 w-4" />
            <span>{userName}</span>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Task</CardTitle>
            <ListTodoIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tamamlanan</CardTitle>
            <CheckCircle2Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Devam Eden</CardTitle>
            <CircleDotIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTasks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tamamlanma Oranı
            </CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks.length > 0
                ? Math.round((completedTasks.length / tasks.length) * 100)
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Son Eklenen Tasklar</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recentTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
          {recentTasks.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              Henüz task eklenmemiş
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
