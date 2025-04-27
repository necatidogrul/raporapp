"use client";

import { useState, useEffect } from "react";
import { KanbanBoard } from "./kanban-board";
import { TaskList } from "./task-list";
import { Button } from "@/components/ui/button";
import {
  LayoutList,
  Kanban,
  PlusIcon,
  UserIcon,
  CheckCircle2Icon,
  ClockIcon,
  CircleDotIcon,
  CalendarIcon,
  ListTodoIcon,
  BarChart3Icon,
  Sparkles,
} from "lucide-react";
import { TaskDialog } from "./task-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTaskStore } from "@/store/task-store";
import { Progress } from "@/components/ui/progress";
import { auth } from "@/lib/firebase";
import { getUserData } from "@/lib/firebase-utils";
import { motion, AnimatePresence } from "framer-motion";

type ViewMode = "list" | "kanban";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export function TaskManager() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [progressValue, setProgressValue] = useState<number>(0);

  const tasks = useTaskStore((state) => state.tasks);

  useEffect(() => {
    // Kullanıcı bilgilerini getir
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

  // Görev istatistikleri
  const completedTasks = tasks.filter((task) => task.status === "COMPLETED");
  const inProgressTasks = tasks.filter((task) => task.status === "IN_PROGRESS");
  const completionRate =
    tasks.length > 0
      ? Math.round((completedTasks.length / tasks.length) * 100)
      : 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgressValue(completionRate);
    }, 300);

    return () => clearTimeout(timer);
  }, [completionRate]);

  return (
    <motion.div
      initial="initial"
      animate="animate"
      className="space-y-8 p-4 max-w-7xl mx-auto"
    >
      {/* Üst banner */}
      <motion.div
        variants={fadeIn}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 p-8 rounded-2xl shadow-lg backdrop-blur-sm border border-violet-200/20"
      >
        <div className="space-y-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <Sparkles className="h-8 w-8 text-violet-600 animate-pulse" />
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-transparent bg-clip-text">
              Görevlerim
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground"
          >
            Görevlerinizi takip edin ve iş akışınızı yönetin
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex gap-3"
        >
          {userName && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 text-sm bg-background/80 backdrop-blur-sm py-2 px-4 rounded-full shadow-md border border-violet-200/20"
            >
              <UserIcon className="h-5 w-5 text-violet-600" />
              <span className="font-medium">{userName}</span>
            </motion.div>
          )}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-background/80 backdrop-blur-sm rounded-lg p-1 flex shadow-md border border-violet-200/20"
          >
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              className={`flex items-center gap-2 transition-all duration-200 ${
                viewMode === "list"
                  ? "bg-violet-600 hover:bg-violet-700 text-white shadow-md"
                  : "hover:bg-violet-100 dark:hover:bg-slate-700"
              }`}
              onClick={() => setViewMode("list")}
            >
              <LayoutList className="h-4 w-4" />
              <span className="hidden sm:inline">Liste</span>
            </Button>
            <Button
              variant={viewMode === "kanban" ? "default" : "ghost"}
              size="sm"
              className={`flex items-center gap-2 transition-all duration-200 ${
                viewMode === "kanban"
                  ? "bg-violet-600 hover:bg-violet-700 text-white shadow-md"
                  : "hover:bg-violet-100 dark:hover:bg-slate-700"
              }`}
              onClick={() => setViewMode("kanban")}
            >
              <Kanban className="h-4 w-4" />
              <span className="hidden sm:inline">Kanban</span>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }}>
            <Button
              onClick={() => setShowNewTaskDialog(true)}
              className="bg-violet-600 hover:bg-violet-700 text-white shadow-md"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Yeni Görev
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* İstatistik kartları */}
      <motion.div
        variants={staggerContainer}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={fadeIn} whileHover={{ scale: 1.02 }}>
          <Card className="overflow-hidden border-l-4 border-l-violet-500 shadow-lg hover:shadow-xl transition-all duration-200 bg-background/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-violet-50/50 dark:bg-violet-950/20">
              <CardTitle className="text-sm font-medium">
                Toplam Görev
              </CardTitle>
              <motion.div
                whileHover={{ rotate: 15 }}
                className="rounded-full bg-violet-100 p-2"
              >
                <ListTodoIcon className="h-5 w-5 text-violet-600" />
              </motion.div>
            </CardHeader>
            <CardContent className="pt-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-3xl font-bold"
              >
                {tasks.length}
              </motion.div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <CalendarIcon className="h-3 w-3 mr-1 text-violet-600" />
                Toplam görev sayısı
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeIn} whileHover={{ scale: 1.02 }}>
          <Card className="overflow-hidden border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-all duration-200 bg-background/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-green-50/50 dark:bg-green-950/20">
              <CardTitle className="text-sm font-medium">Tamamlanan</CardTitle>
              <motion.div
                whileHover={{ rotate: 15 }}
                className="rounded-full bg-green-100 p-2"
              >
                <CheckCircle2Icon className="h-5 w-5 text-green-500" />
              </motion.div>
            </CardHeader>
            <CardContent className="pt-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-3xl font-bold"
              >
                {completedTasks.length}
              </motion.div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <CheckCircle2Icon className="h-3 w-3 mr-1 text-green-500" />
                Tamamlanan görevler
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeIn} whileHover={{ scale: 1.02 }}>
          <Card className="overflow-hidden border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-all duration-200 bg-background/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-blue-50/50 dark:bg-blue-950/20">
              <CardTitle className="text-sm font-medium">Devam Eden</CardTitle>
              <motion.div
                whileHover={{ rotate: 15 }}
                className="rounded-full bg-blue-100 p-2"
              >
                <CircleDotIcon className="h-5 w-5 text-blue-500" />
              </motion.div>
            </CardHeader>
            <CardContent className="pt-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-3xl font-bold"
              >
                {inProgressTasks.length}
              </motion.div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <CircleDotIcon className="h-3 w-3 mr-1 text-blue-500" />
                Devam eden görevler
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeIn} whileHover={{ scale: 1.02 }}>
          <Card className="overflow-hidden border-l-4 border-l-amber-500 shadow-lg hover:shadow-xl transition-all duration-200 bg-background/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-amber-50/50 dark:bg-amber-950/20">
              <CardTitle className="text-sm font-medium">
                Tamamlanma Oranı
              </CardTitle>
              <motion.div
                whileHover={{ rotate: 15 }}
                className="rounded-full bg-amber-100 p-2"
              >
                <BarChart3Icon className="h-5 w-5 text-amber-500" />
              </motion.div>
            </CardHeader>
            <CardContent className="pt-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2"
              >
                <div className="text-3xl font-bold">{completionRate}%</div>
              </motion.div>
              <div className="mt-2">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Progress value={progressValue} className="h-2" />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Ana içerik */}
      <motion.div
        variants={fadeIn}
        className="bg-background/80 backdrop-blur-sm rounded-2xl border shadow-lg p-8"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <h2 className="text-xl font-semibold flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-transparent bg-clip-text">
            <ClockIcon className="h-5 w-5 text-violet-600" />
            {viewMode === "kanban" ? "Görev Panosu" : "Görev Listesi"}
          </h2>

          <motion.div whileHover={{ scale: 1.02 }}>
            <Button
              onClick={() => setShowNewTaskDialog(true)}
              variant="outline"
              className="border-violet-200 hover:border-violet-300 hover:bg-violet-50 shadow-sm"
            >
              <PlusIcon className="w-4 h-4 mr-2 text-violet-600" />
              Yeni Görev
            </Button>
          </motion.div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {viewMode === "kanban" ? <KanbanBoard hideHeader /> : <TaskList />}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <TaskDialog
        mode="create"
        open={showNewTaskDialog}
        onOpenChange={setShowNewTaskDialog}
      />
    </motion.div>
  );
}
