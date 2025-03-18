"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useTaskStore } from "@/store/task-store";
import { Task } from "@/types/task";
import { WeeklyReportFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createWeeklyReport } from "@/lib/firebase-utils";

interface TaskNoteMap {
  [taskId: string]: string;
}

export function WeeklyReport() {
  const { user } = useAuth();
  const tasks = useTaskStore((state) => state.tasks);
  const [weeklyTasks, setWeeklyTasks] = useState<Task[]>([]);
  const [report, setReport] = useState<WeeklyReportFormValues | null>(null);
  const [taskNotes, setTaskNotes] = useState<TaskNoteMap>({});
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Mevcut haftanın tamamlanmış tasklarını filtrele
    const currentWeekNumber = getCurrentWeekNumber();
    const completedTasks = tasks.filter(
      (task) => task.status === "COMPLETED" && task.userId === user.uid
    );

    setWeeklyTasks(completedTasks);

    // Raporu oluştur
    if (completedTasks.length > 0) {
      const weeklyReport: WeeklyReportFormValues = {
        weekNumber: currentWeekNumber,
        startDate: getWeekStartDate(currentWeekNumber),
        endDate: getWeekEndDate(currentWeekNumber),
        organizationId: completedTasks[0]?.organizationId || "",
        userId: user.uid,
        tasks: completedTasks,
        status: "DRAFT",
      };

      setReport(weeklyReport);
    }
  }, [tasks, user]);

  const getCurrentWeekNumber = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.ceil(diff / oneWeek);
  };

  const getWeekStartDate = (weekNumber: number) => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    return new Date(
      start.getTime() + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1000
    );
  };

  const getWeekEndDate = (weekNumber: number) => {
    const startDate = getWeekStartDate(weekNumber);
    return new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
  };

  const handleNoteChange = (taskId: string, note: string) => {
    setTaskNotes((prev) => ({ ...prev, [taskId]: note }));
  };

  const handleSubmitReport = async () => {
    if (!report || !user) return;

    try {
      setIsSubmitting(true);

      // Rapor içeriğini oluştur
      const content = weeklyTasks
        .map(
          (task) =>
            `## ${task.title}\n${task.description}\n\nDurum: ${
              task.status === "COMPLETED" ? "Tamamlandı" : "Devam Ediyor"
            }\nNotlar: ${taskNotes[task.id] || "Not eklenmemiş"}\n`
        )
        .join("\n---\n");

      await createWeeklyReport({
        userId: user.uid,
        userName: user.displayName || "İsimsiz Kullanıcı",
        managerId: weeklyTasks[0]?.managerId || "",
        organizationId: weeklyTasks[0]?.organizationId || "",
        content,
        weekStartDate: report.startDate,
        weekEndDate: report.endDate,
      });

      toast.success("Rapor başarıyla gönderildi");
      setShowPreview(false);
    } catch (error) {
      console.error("Rapor gönderilirken hata:", error);
      toast.error("Rapor gönderilirken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!report || weeklyTasks.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        Bu hafta için henüz tamamlanmış task bulunmuyor.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {report.weekNumber}. Hafta Raporu (
          {format(report.startDate, "d MMMM yyyy", { locale: tr })} -{" "}
          {format(report.endDate, "d MMMM yyyy", { locale: tr })})
        </h2>
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogTrigger asChild>
            <Button>Raporu Önizle ve Gönder</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Rapor Önizleme</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {weeklyTasks.map((task) => (
                <Card key={task.id}>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      {task.title}
                      <Badge variant="secondary">
                        {task.priority === "LOW"
                          ? "Düşük"
                          : task.priority === "MEDIUM"
                          ? "Orta"
                          : "Yüksek"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {task.description}
                    </p>
                    <div className="text-sm">
                      <p>
                        <strong>Başlangıç:</strong>{" "}
                        {format(task.startDate, "d MMMM yyyy", { locale: tr })}
                      </p>
                      <p>
                        <strong>Bitiş:</strong>{" "}
                        {format(task.endDate, "d MMMM yyyy", { locale: tr })}
                      </p>
                      <p>
                        <strong>Notlar:</strong>{" "}
                        {taskNotes[task.id] || "Not eklenmemiş"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Düzenle
              </Button>
              <Button onClick={handleSubmitReport} disabled={isSubmitting}>
                {isSubmitting ? "Gönderiliyor..." : "Raporu Gönder"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {weeklyTasks.map((task) => (
          <Card key={task.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {task.title}
                <Badge variant="secondary">
                  {task.priority === "LOW"
                    ? "Düşük"
                    : task.priority === "MEDIUM"
                    ? "Orta"
                    : "Yüksek"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {task.description}
              </p>
              <div className="text-sm mb-4">
                <p>
                  <strong>Başlangıç:</strong>{" "}
                  {format(task.startDate, "d MMMM yyyy", { locale: tr })}
                </p>
                <p>
                  <strong>Bitiş:</strong>{" "}
                  {format(task.endDate, "d MMMM yyyy", { locale: tr })}
                </p>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor={`note-${task.id}`}
                  className="text-sm font-medium"
                >
                  Task ile ilgili notlar:
                </label>
                <Textarea
                  id={`note-${task.id}`}
                  value={taskNotes[task.id] || ""}
                  onChange={(e) => handleNoteChange(task.id, e.target.value)}
                  placeholder="Bu task ile ilgili notlarınızı ekleyin..."
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
