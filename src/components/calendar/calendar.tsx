"use client";

import { useTaskStore } from "@/store/task-store";
import { Task, TaskStore } from "@/types/task";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, startOfMonth, getDaysInMonth, addDays } from "date-fns";
import { tr } from "date-fns/locale";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { TaskDialog } from "./task-dialog";

const formatDate = (date: Date, formatStr: string) => {
  try {
    return format(date, formatStr, { locale: tr });
  } catch (error) {
    console.error("Date formatting error:", error);
    return format(date, "dd.MM.yyyy");
  }
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Takvim</h1>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            <h2 className="text-xl">Ocak 2025</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={previousMonth}
              className="text-sm hover:text-gray-600"
            >
              Önceki
            </button>
            <button onClick={nextMonth} className="text-sm hover:text-gray-600">
              Sonraki
            </button>
          </div>
        </div>
        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-7 border-b">
            {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((day) => (
              <div
                key={day}
                className="p-4 text-center text-sm text-gray-600 border-r last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day: Date) => {
              const dayTasks = getTasksForDate(day);
              const taskNumbers = dayTasks.map((task) => task.id).join(", ");
              return (
                <div
                  key={day.toString()}
                  className={cn(
                    "p-4 border-r border-b last:border-r-0 min-h-[100px]",
                    dayTasks.length > 0 && "bg-blue-50"
                  )}
                >
                  <span className="text-lg">{formatDate(day, "d")}</span>
                  {dayTasks.length > 0 && (
                    <div className="mt-2">
                      <span className="text-sm text-blue-600">
                        {taskNumbers}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <TaskDialog
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
      />
    </div>
  );
}
