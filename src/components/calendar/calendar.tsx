"use client";

import { useTaskStore } from "@/store/task-store";
import { Task, TaskStore } from "@/types/task";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  format,
  startOfMonth,
  getDaysInMonth,
  addDays,
  isSameMonth,
  isToday,
} from "date-fns";
import { tr } from "date-fns/locale";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { TaskDialog } from "./task-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";

const formatDate = (date: Date, formatStr: string) => {
  try {
    return format(date, formatStr, { locale: tr });
  } catch (error) {
    console.error("Date formatting error:", error);
    return format(date, "dd.MM.yyyy");
  }
};

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export function Calendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const tasks = useTaskStore((state: TaskStore) => state.tasks);

  const monthStart = startOfMonth(selectedDate);
  const daysInMonth = getDaysInMonth(selectedDate);
  const days = Array.from({ length: daysInMonth }, (_, i) =>
    addDays(monthStart, i)
  );

  const getTasksForDate = (date: Date) => {
    return tasks.filter((task: Task) => {
      const taskStart = new Date(task.startDate);
      const taskEnd = new Date(task.endDate);
      return date >= taskStart && date <= taskEnd;
    });
  };

  const previousMonth = () => {
    setSelectedDate(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setSelectedDate(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1)
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "IN_PROGRESS":
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-700 border-green-200";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-amber-100 text-amber-700 border-amber-200";
    }
  };

  return (
    <motion.div initial="initial" animate="animate" className="p-6 space-y-8">
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
              Takvim
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground"
          >
            Görevlerinizi takvim üzerinde planlayın ve takip edin
          </motion.p>
        </div>
      </motion.div>

      <motion.div variants={fadeIn} className="space-y-6">
        <div className="flex items-center justify-between bg-background/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-violet-200/20">
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-5 w-5 text-violet-600" />
            <h2 className="text-xl font-semibold bg-gradient-to-r from-violet-600 to-purple-600 text-transparent bg-clip-text">
              {formatDate(selectedDate, "MMMM yyyy")}
            </h2>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={previousMonth}
              className="hover:bg-violet-50 hover:text-violet-600 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextMonth}
              className="hover:bg-violet-50 hover:text-violet-600 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <motion.div
          variants={fadeIn}
          className="bg-background/80 backdrop-blur-sm rounded-xl border shadow-lg overflow-hidden"
        >
          <div className="grid grid-cols-7 border-b bg-violet-50/50">
            {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((day) => (
              <div
                key={day}
                className="p-4 text-center text-sm font-medium text-violet-600 border-r last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            <AnimatePresence mode="wait">
              {days.map((day: Date) => {
                const dayTasks = getTasksForDate(day);
                return (
                  <motion.div
                    key={day.toString()}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "p-4 border-r border-b last:border-r-0 min-h-[120px] transition-colors",
                      !isSameMonth(day, selectedDate) && "bg-gray-50/50",
                      isToday(day) && "bg-violet-50/50 border-violet-200",
                      dayTasks.length > 0 &&
                        "hover:bg-violet-50/80 cursor-pointer group"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
                        isToday(day) && "bg-violet-600 text-white shadow-sm"
                      )}
                    >
                      {formatDate(day, "d")}
                    </span>
                    {dayTasks.length > 0 && (
                      <HoverCard>
                        <HoverCardTrigger>
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-2 space-y-1"
                          >
                            {dayTasks.slice(0, 2).map((task) => (
                              <div
                                key={task.id}
                                className={cn(
                                  "text-xs px-2 py-1 rounded-md border transition-colors group-hover:shadow-sm",
                                  getStatusColor(task.status)
                                )}
                              >
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(task.status)}
                                  <span className="truncate">{task.title}</span>
                                </div>
                              </div>
                            ))}
                            {dayTasks.length > 2 && (
                              <Badge
                                variant="secondary"
                                className="w-full justify-center"
                              >
                                +{dayTasks.length - 2} daha
                              </Badge>
                            )}
                          </motion.div>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80 p-2" align="start">
                          <div className="space-y-2">
                            <h4 className="font-medium">
                              {formatDate(day, "d MMMM")} Görevleri
                            </h4>
                            <div className="space-y-1">
                              {dayTasks.map((task) => (
                                <div
                                  key={task.id}
                                  className={cn(
                                    "text-sm px-3 py-2 rounded-lg border",
                                    getStatusColor(task.status)
                                  )}
                                >
                                  <div className="flex items-center gap-2">
                                    {getStatusIcon(task.status)}
                                    <span>{task.title}</span>
                                  </div>
                                  {task.description && (
                                    <p className="mt-1 text-xs opacity-80">
                                      {task.description}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>

      <TaskDialog
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
      />
    </motion.div>
  );
}
