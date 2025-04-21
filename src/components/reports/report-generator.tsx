"use client";

import { useState } from "react";
import { useTaskStore } from "@/store/task-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import { tr } from "date-fns/locale";
import { FileTextIcon, DownloadIcon } from "lucide-react";

export function ReportGenerator() {
  const [selectedWeek, setSelectedWeek] = useState<string>(
    format(new Date(), "yyyy-'W'ww")
  );
  const tasks = useTaskStore((state) => state.tasks);

  const getWeekDates = (weekString: string) => {
    const [year, week] = weekString.split("-W");
    const date = new Date(parseInt(year), 0, 1 + (parseInt(week) - 1) * 7);
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = endOfWeek(date, { weekStartsOn: 1 });
    return { start, end };
  };

  const getWeekTasks = () => {
    const { start, end } = getWeekDates(selectedWeek);
    return tasks.filter((task) => {
      const taskStart = new Date(task.startDate);
      const taskEnd = new Date(task.endDate);
      return (
        isWithinInterval(taskStart, { start, end }) ||
        isWithinInterval(taskEnd, { start, end })
      );
    });
  };

  const generateReport = () => {
    const weekTasks = getWeekTasks();
    const { start, end } = getWeekDates(selectedWeek);

    const report = {
      title: `Haftalık Rapor (${format(start, "d MMMM", {
        locale: tr,
      })} - ${format(end, "d MMMM yyyy", { locale: tr })})`,
      tasks: weekTasks.map((task) => ({
        title: task.title,
        description: task.description,
        status: task.status === "COMPLETED" ? "Tamamlandı" : "Devam Ediyor",
        priority:
          task.priority === "LOW"
            ? "Düşük"
            : task.priority === "MEDIUM"
            ? "Orta"
            : "Yüksek",
        startDate: format(new Date(task.startDate), "d MMMM yyyy", {
          locale: tr,
        }),
        endDate: format(new Date(task.endDate), "d MMMM yyyy", { locale: tr }),
      })),
    };

    // Rapor indirme işlemi burada yapılacak
    const jsonString = JSON.stringify(report, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rapor-${selectedWeek}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const weeks = Array.from({ length: 52 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - date.getDay() + i * 7);
    return format(date, "yyyy-'W'ww");
  });

  const weekTasks = getWeekTasks();

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Select value={selectedWeek} onValueChange={setSelectedWeek}>
              <SelectTrigger>
                <SelectValue placeholder="Hafta seçin" />
              </SelectTrigger>
              <SelectContent>
                {weeks.map((week) => {
                  const { start, end } = getWeekDates(week);
                  return (
                    <SelectItem key={week} value={week}>
                      {format(start, "d MMMM", { locale: tr })} -{" "}
                      {format(end, "d MMMM yyyy", { locale: tr })}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={generateReport}>
            <DownloadIcon className="h-4 w-4 mr-2" />
            Rapor İndir
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Haftalık Özet</h2>
        {weekTasks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Bu haftaya ait task bulunamadı
          </div>
        ) : (
          <div className="space-y-2">
            {weekTasks.map((task) => (
              <Card key={task.id} className="p-4">
                <div className="flex items-start gap-4">
                  <FileTextIcon className="h-5 w-5 mt-1 text-muted-foreground" />
                  <div className="flex-1 space-y-1">
                    <div className="font-medium">{task.title}</div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {task.description}
                    </p>
                    <div className="flex gap-2 text-sm">
                      <span className="text-muted-foreground">
                        {format(new Date(task.startDate), "d MMM", {
                          locale: tr,
                        })}{" "}
                        -{" "}
                        {format(new Date(task.endDate), "d MMM", {
                          locale: tr,
                        })}
                      </span>
                      <span
                        className={
                          task.status === "COMPLETED"
                            ? "text-green-600"
                            : "text-blue-600"
                        }
                      >
                        {task.status === "COMPLETED"
                          ? "Tamamlandı"
                          : "Devam Ediyor"}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
