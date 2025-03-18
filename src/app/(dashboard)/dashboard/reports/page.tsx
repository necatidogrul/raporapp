"use client";

import { useTaskStore } from "@/store/task-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";
import { tr } from "date-fns/locale";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function ReportsPage() {
  const tasks = useTaskStore((state) => state.tasks);
  const [name, setName] = useState("");
  const [projectName, setProjectName] = useState("");

  // İstatistikleri hesapla
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (task) => task.status === "COMPLETED"
  ).length;
  const inProgressTasks = tasks.filter(
    (task) => task.status === "IN_PROGRESS"
  ).length;
  const completionRate =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Önceliğe göre görevleri grupla
  const tasksByPriority = {
    HIGH: tasks.filter((task) => task.priority === "HIGH").length,
    MEDIUM: tasks.filter((task) => task.priority === "MEDIUM").length,
    LOW: tasks.filter((task) => task.priority === "LOW").length,
  };

  // Son 7 günde oluşturulan görevler
  const lastWeekTasks = tasks.filter((task) => {
    const taskDate = new Date(task.startDate);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return taskDate >= weekAgo;
  }).length;

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.addFont(
      "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf",
      "Roboto",
      "normal"
    );
    doc.setFont("Roboto");

    const today = format(new Date(), "d MMMM yyyy", { locale: tr });

    // Başlık ve Kişisel Bilgiler
    doc.setFontSize(20);
    doc.text("Görev Raporu", 20, 20);
    doc.setFontSize(12);
    doc.text(`Oluşturulma Tarihi: ${today}`, 20, 30);
    doc.text(`İsim Soyisim: ${name}`, 20, 40);
    doc.text(`Proje Adı: ${projectName}`, 20, 50);

    // Tüm Görevler (Numaralandırılmış)
    doc.setFontSize(16);
    doc.text("Görev Listesi", 20, 65);

    const allTasksList = tasks.map((task, index) => [
      `${index + 1}`,
      task.title,
      task.status === "COMPLETED" ? "Tamamlandı" : "Devam Ediyor",
      format(new Date(task.endDate), "d MMMM yyyy", { locale: tr }),
      task.priority === "HIGH"
        ? "Yüksek"
        : task.priority === "MEDIUM"
        ? "Orta"
        : "Düşük",
    ]);

    autoTable(doc, {
      startY: 70,
      head: [["No", "Görev", "Durum", "Bitiş Tarihi", "Öncelik"]],
      body: allTasksList,
      theme: "striped",
      styles: {
        font: "Roboto",
        fontStyle: "normal",
      },
    });

    // Takvim Görünümü
    doc.setFontSize(16);
    doc.text("Takvim Görünümü", 20, doc.lastAutoTable.finalY + 20);

    const currentDate = new Date();
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Ay ve yıl başlığı
    doc.setFontSize(14);
    doc.setTextColor(51, 51, 51);
    doc.text(
      format(currentDate, "MMMM yyyy", { locale: tr }),
      20,
      doc.lastAutoTable.finalY + 35
    );

    // Takvim başlıkları
    const calendarHeaders = [["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]];

    // Takvim verilerini haftalık olarak grupla
    const weeks = [];
    let currentWeek = [];

    // Ayın ilk gününün haftanın hangi günü olduğunu bul (0: Pazar, 1: Pazartesi, ...)
    let firstDayOfMonth = monthStart.getDay();
    // Pazartesi'den başlayacak şekilde ayarla
    firstDayOfMonth = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    // Önceki ayın günlerini boş bırak
    for (let i = 0; i < firstDayOfMonth; i++) {
      currentWeek.push("");
    }

    // Ayın günlerini ekle
    days.forEach((day, index) => {
      const dayTasks = tasks
        .filter((task) => isSameDay(new Date(task.endDate), day))
        .map((task) => ({
          id: tasks.findIndex((t) => t.id === task.id) + 1,
          status: task.status,
        }));

      const dayString = format(day, "d");
      const completedTasks = dayTasks.filter((t) => t.status === "COMPLETED");
      const inProgressTasks = dayTasks.filter(
        (t) => t.status === "IN_PROGRESS"
      );

      let cellContent = dayString;
      if (dayTasks.length > 0) {
        if (completedTasks.length > 0) {
          cellContent += `\n(${completedTasks.length} ✓)`;
        }
        if (inProgressTasks.length > 0) {
          cellContent += `\n(${inProgressTasks.length} →)`;
        }
      }

      currentWeek.push(cellContent);

      if ((firstDayOfMonth + index + 1) % 7 === 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    // Son haftayı tamamla
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push("");
      }
      weeks.push(currentWeek);
    }

    // Takvimi çiz
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 40,
      head: calendarHeaders,
      body: weeks,
      theme: "grid",
      styles: {
        font: "Roboto",
        fontStyle: "normal",
        cellPadding: 8,
        halign: "center",
        valign: "middle",
        lineWidth: 0.2,
        lineColor: [229, 231, 235], // Tailwind gray-200
        fontSize: 10,
        textColor: [51, 51, 51],
      },
      headStyles: {
        fillColor: [243, 244, 246], // Tailwind gray-100
        textColor: [107, 114, 128], // Tailwind gray-500
        fontSize: 10,
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 },
        6: { cellWidth: 25 },
      },
      didDrawCell: function (data) {
        if (data.section === "body") {
          const text = data.cell.text[0];
          if (text && text.includes("✓")) {
            // Tamamlanan görevler için yeşil arka plan
            doc.setFillColor(209, 250, 229); // Tailwind green-100
            doc.rect(
              data.cell.x,
              data.cell.y,
              data.cell.width,
              data.cell.height,
              "F"
            );
          } else if (text && text.includes("→")) {
            // Devam eden görevler için mavi arka plan
            doc.setFillColor(219, 234, 254); // Tailwind blue-100
            doc.rect(
              data.cell.x,
              data.cell.y,
              data.cell.width,
              data.cell.height,
              "F"
            );
          }
        }
      },
    });

    // PDF'i indir
    doc.save(`gorev-raporu-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Raporlar</h1>
          <Button onClick={downloadPDF}>
            <Download className="w-4 h-4 mr-2" />
            PDF İndir
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            placeholder="İsim Soyisim"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Proje Adı"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Toplam Görev</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalTasks}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tamamlanan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-500">
              {completedTasks}
            </p>
            <p className="text-sm text-muted-foreground">
              {completionRate.toFixed(1)}% tamamlandı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Devam Eden</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-500">
              {inProgressTasks}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Son 7 Gün</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-500">
              {lastWeekTasks}
            </p>
            <p className="text-sm text-muted-foreground">yeni görev</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 mt-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Öncelik Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Yüksek</span>
                  <span className="text-sm text-muted-foreground">
                    {tasksByPriority.HIGH} görev
                  </span>
                </div>
                <div className="h-2 bg-red-200 rounded">
                  <div
                    className="h-2 bg-red-500 rounded"
                    style={{
                      width: `${(tasksByPriority.HIGH / totalTasks) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Orta</span>
                  <span className="text-sm text-muted-foreground">
                    {tasksByPriority.MEDIUM} görev
                  </span>
                </div>
                <div className="h-2 bg-yellow-200 rounded">
                  <div
                    className="h-2 bg-yellow-500 rounded"
                    style={{
                      width: `${(tasksByPriority.MEDIUM / totalTasks) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Düşük</span>
                  <span className="text-sm text-muted-foreground">
                    {tasksByPriority.LOW} görev
                  </span>
                </div>
                <div className="h-2 bg-green-200 rounded">
                  <div
                    className="h-2 bg-green-500 rounded"
                    style={{
                      width: `${(tasksByPriority.LOW / totalTasks) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Son Tamamlanan Görevler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks
                .filter((task) => task.status === "COMPLETED")
                .slice(0, 5)
                .map((task, index) => (
                  <div
                    key={task.id}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">
                        {index + 1}. {task.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(task.endDate), "d MMMM yyyy", {
                          locale: tr,
                        })}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        task.priority === "HIGH"
                          ? "bg-red-100 text-red-700"
                          : task.priority === "MEDIUM"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {task.priority === "HIGH" && "Yüksek"}
                      {task.priority === "MEDIUM" && "Orta"}
                      {task.priority === "LOW" && "Düşük"}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
