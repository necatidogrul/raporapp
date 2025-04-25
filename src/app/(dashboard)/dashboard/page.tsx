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
  BarChart3Icon,
  ArrowUpIcon,
  TrendingUpIcon,
  CalendarIcon,
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { getUserData } from "@/lib/firebase-utils";
import { Progress } from "@/components/ui/progress";

export default function DashboardPage() {
  const tasks = useTaskStore((state) => state.tasks);
  const [userName, setUserName] = useState<string>("");
  const [progressValue, setProgressValue] = useState<number>(0);

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

  useEffect(() => {
    // Animasyonlu progress bar için
    const completionRate =
      tasks.length > 0
        ? Math.round((completedTasks.length / tasks.length) * 100)
        : 0;

    const timer = setTimeout(() => {
      setProgressValue(completionRate);
    }, 300);

    return () => clearTimeout(timer);
  }, [tasks]);

  const completedTasks = tasks.filter((task) => task.status === "COMPLETED");
  const inProgressTasks = tasks.filter((task) => task.status === "IN_PROGRESS");
  const recentTasks = [...tasks]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 3);

  const completionRate =
    tasks.length > 0
      ? Math.round((completedTasks.length / tasks.length) * 100)
      : 0;

  return (
    <div className="space-y-8 p-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-xl shadow-sm">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Hoş Geldiniz
          </h1>
          <p className="text-muted-foreground mt-1">
            Görevlerinizi takip edin ve iş akışınızı yönetin
          </p>
        </div>
        {userName && (
          <div className="flex items-center gap-3 text-sm bg-background py-2 px-4 rounded-full shadow-sm border">
            <UserIcon className="h-5 w-5 text-primary" />
            <span className="font-medium">{userName}</span>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
            <CardTitle className="text-sm font-medium">Toplam Task</CardTitle>
            <div className="rounded-full bg-primary/10 p-2">
              <ListTodoIcon className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">{tasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <TrendingUpIcon className="h-3 w-3 mr-1 text-primary" />
              Toplam görev sayısı
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
            <CardTitle className="text-sm font-medium">Tamamlanan</CardTitle>
            <div className="rounded-full bg-green-100 p-2">
              <CheckCircle2Icon className="h-5 w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">{completedTasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <ArrowUpIcon className="h-3 w-3 mr-1 text-green-500" />
              Tamamlanan görevler
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
            <CardTitle className="text-sm font-medium">Devam Eden</CardTitle>
            <div className="rounded-full bg-blue-100 p-2">
              <CircleDotIcon className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">{inProgressTasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <CalendarIcon className="h-3 w-3 mr-1 text-blue-500" />
              Devam eden görevler
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
            <CardTitle className="text-sm font-medium">
              Tamamlanma Oranı
            </CardTitle>
            <div className="rounded-full bg-amber-100 p-2">
              <BarChart3Icon className="h-5 w-5 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="text-3xl font-bold">{completionRate}%</div>
            </div>
            <div className="mt-2">
              <Progress value={progressValue} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card rounded-xl border shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <ClockIcon className="h-5 w-5 text-primary" />
            Son Eklenen Görevler
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recentTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
          {recentTasks.length === 0 && (
            <div className="col-span-full bg-muted/20 rounded-lg text-center py-12 text-muted-foreground">
              Henüz görev eklenmemiş
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
