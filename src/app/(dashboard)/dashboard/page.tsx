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
  Sparkles,
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { getUserData } from "@/lib/firebase-utils";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const scaleIn = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.3 },
};

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
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 pb-8 max-w-7xl mx-auto">
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-background border shadow-lg"
      >
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(56,189,248,0.1),rgba(168,85,247,0.1))]" />
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black,transparent)]" />
        <div className="relative flex flex-col gap-3 sm:gap-4 p-4 sm:p-6 md:p-8">
          <div className="space-y-1 sm:space-y-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary animate-pulse" />
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-purple-600 to-blue-600 text-transparent bg-clip-text">
                Hoş Geldiniz
              </h1>
            </div>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
              Görevlerinizi takip edin ve iş akışınızı yönetin
            </p>
          </div>
          {userName && (
            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm bg-background/80 backdrop-blur-sm py-1.5 sm:py-2 px-3 sm:px-4 rounded-full shadow-lg border transition-all hover:bg-background/90 self-start">
              <UserIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-primary" />
              <span className="font-medium truncate max-w-[150px]">
                {userName}
              </span>
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
        <motion.div
          {...scaleIn}
          className="col-span-2 sm:col-span-1 transition-transform duration-200 hover:scale-[1.02]"
        >
          <Card className="overflow-hidden border-l-4 border-l-primary shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 sm:pb-2 bg-muted/30 px-3 sm:px-4 pt-2 sm:pt-3">
              <CardTitle className="text-[11px] sm:text-xs md:text-sm font-medium truncate">
                Toplam Task
              </CardTitle>
              <div className="rounded-full bg-primary/10 p-1 sm:p-1.5 md:p-2 shrink-0">
                <ListTodoIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="pt-2 sm:pt-3 md:pt-4 px-3 sm:px-4">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
                {tasks.length}
              </div>
              <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground mt-0.5 sm:mt-1 flex items-center">
                <TrendingUpIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 text-primary shrink-0" />
                <span className="truncate">Toplam görev sayısı</span>
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          {...scaleIn}
          className="transition-transform duration-200 hover:scale-[1.02]"
        >
          <Card className="overflow-hidden border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 sm:pb-2 bg-muted/30 px-3 sm:px-4 pt-2 sm:pt-3">
              <CardTitle className="text-[11px] sm:text-xs md:text-sm font-medium truncate">
                Tamamlanan
              </CardTitle>
              <div className="rounded-full bg-green-100 p-1 sm:p-1.5 md:p-2 shrink-0">
                <CheckCircle2Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-green-500" />
              </div>
            </CardHeader>
            <CardContent className="pt-2 sm:pt-3 md:pt-4 px-3 sm:px-4">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-500 to-green-600 text-transparent bg-clip-text">
                {completedTasks.length}
              </div>
              <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground mt-0.5 sm:mt-1 flex items-center">
                <ArrowUpIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 text-green-500 shrink-0" />
                <span className="truncate">Tamamlanan görevler</span>
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          {...scaleIn}
          className="transition-transform duration-200 hover:scale-[1.02]"
        >
          <Card className="overflow-hidden border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 sm:pb-2 bg-muted/30 px-3 sm:px-4 pt-2 sm:pt-3">
              <CardTitle className="text-[11px] sm:text-xs md:text-sm font-medium truncate">
                Devam Eden
              </CardTitle>
              <div className="rounded-full bg-blue-100 p-1 sm:p-1.5 md:p-2 shrink-0">
                <CircleDotIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent className="pt-2 sm:pt-3 md:pt-4 px-3 sm:px-4">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-transparent bg-clip-text">
                {inProgressTasks.length}
              </div>
              <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground mt-0.5 sm:mt-1 flex items-center">
                <CalendarIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 text-blue-500 shrink-0" />
                <span className="truncate">Devam eden görevler</span>
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          {...scaleIn}
          className="transition-transform duration-200 hover:scale-[1.02]"
        >
          <Card className="overflow-hidden border-l-4 border-l-amber-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 sm:pb-2 bg-muted/30 px-3 sm:px-4 pt-2 sm:pt-3">
              <CardTitle className="text-[11px] sm:text-xs md:text-sm font-medium truncate">
                Tamamlanma Oranı
              </CardTitle>
              <div className="rounded-full bg-amber-100 p-1 sm:p-1.5 md:p-2 shrink-0">
                <BarChart3Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-amber-500" />
              </div>
            </CardHeader>
            <CardContent className="pt-2 sm:pt-3 md:pt-4 px-3 sm:px-4">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-transparent bg-clip-text">
                {completionRate}%
              </div>
              <div className="mt-1.5 sm:mt-2">
                <Progress
                  value={progressValue}
                  className="h-1 sm:h-1.5 md:h-2"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {recentTasks.length > 0 && (
        <motion.div {...fadeInUp} className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-1.5 sm:gap-2 px-1">
            <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <h2 className="text-base sm:text-lg font-semibold">Son Görevler</h2>
          </div>
          <div className="grid gap-2 sm:gap-4">
            {recentTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
