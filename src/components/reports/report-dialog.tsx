"use client";

import { useState, useEffect } from "react";
import { useReportStore } from "@/store/report-store";
import { useTaskStore } from "@/store/task-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CalendarIcon, PlusIcon, TrashIcon } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Task } from "@/types/task";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ReportDialogProps {
  reportId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportDialog({
  reportId,
  open,
  onOpenChange,
}: ReportDialogProps) {
  const reports = useReportStore((state) => state.reports);
  const updateReport = useReportStore((state) => state.updateReport);
  const addTaskToReport = useReportStore((state) => state.addTaskToReport);
  const removeTaskFromReport = useReportStore(
    (state) => state.removeTaskFromReport
  );
  const tasks = useTaskStore((state) => state.tasks);

  const report = reports.find((r) => r.id === reportId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());

  useEffect(() => {
    if (report) {
      setTitle(report.title);
      setDescription(report.description);
      setStartDate(new Date(report.startDate));
      setEndDate(new Date(report.endDate));
    }
  }, [report]);

  const handleSave = () => {
    if (report) {
      updateReport(reportId, {
        title,
        description,
        startDate,
        endDate,
      });
      onOpenChange(false);
    }
  };

  const handleAddTask = (task: Task) => {
    addTaskToReport(reportId, task);
  };

  const handleRemoveTask = (taskId: string) => {
    removeTaskFromReport(reportId, taskId);
  };

  const isTaskInReport = (taskId: string) => {
    return report?.tasks.some((task) => task.id === taskId) || false;
  };

  if (!report) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rapor Düzenle</DialogTitle>
          <DialogDescription>
            Rapor bilgilerini düzenleyin ve görevleri ekleyin.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Rapor Detayları</TabsTrigger>
            <TabsTrigger value="tasks">Görevler</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Rapor Başlığı</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Haftalık Rapor"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Rapor açıklaması..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Başlangıç Tarihi</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? (
                          format(startDate, "PPP", { locale: tr })
                        ) : (
                          <span>Tarih seçin</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => date && setStartDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid gap-2">
                  <Label>Bitiş Tarihi</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? (
                          format(endDate, "PPP", { locale: tr })
                        ) : (
                          <span>Tarih seçin</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => date && setEndDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4 py-4">
            <div className="grid gap-4">
              <div>
                <h3 className="text-lg font-medium mb-2">
                  Rapora Eklenen Görevler
                </h3>
                {report.tasks.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                      Henüz rapora görev eklenmemiş.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {report.tasks.map((task) => (
                      <Card key={task.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-sm">
                              {task.title}
                            </CardTitle>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveTask(task.id)}
                            >
                              <TrashIcon className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          <CardDescription className="text-xs">
                            {format(new Date(task.startDate), "d MMM", {
                              locale: tr,
                            })}{" "}
                            -{" "}
                            {format(new Date(task.endDate), "d MMM", {
                              locale: tr,
                            })}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Mevcut Görevler</h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {tasks
                    .filter((task) => !isTaskInReport(task.id))
                    .map((task) => (
                      <Card key={task.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-sm">
                                {task.title}
                              </CardTitle>
                              <CardDescription className="text-xs">
                                {format(new Date(task.startDate), "d MMM", {
                                  locale: tr,
                                })}{" "}
                                -{" "}
                                {format(new Date(task.endDate), "d MMM", {
                                  locale: tr,
                                })}
                              </CardDescription>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleAddTask(task)}
                            >
                              <PlusIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button onClick={handleSave}>Kaydet</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
