import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Download, FileText, Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Report } from "@/types/report";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ReportFormatterProps {
  report: Report;
  showControls?: boolean;
}

export function ReportFormatter({
  report,
  showControls = true,
}: ReportFormatterProps) {
  const [fontLoaded, setFontLoaded] = useState(false);

  // Font kullanımını düzenleme - hata çözümü
  useEffect(() => {
    // Varsayılan fontları kullanacağımız için sadece başlangıç durumunu belirle
    setFontLoaded(true);
  }, []);

  // Markdown içeriği hazırla
  const getFormattedContent = () => {
    const content = report.content || report.description || "";

    if (content.includes("##")) {
      // İçerik zaten markdown formatında, olduğu gibi döndür
      return content;
    }

    // Metin basit formatta ise, basit bir markdown dönüşümü yap
    const lines = content.split("\n");
    return lines.map((line) => line.trim()).join("\n\n");
  };

  // PDF'e aktar
  const exportToPDF = () => {
    try {
      // Unicode desteği ile PDF oluştur
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Yerleşik Helvetica fontuna geç (daha iyi Unicode desteği için)
      doc.setFont("helvetica");

      // Başlık
      doc.setFillColor(30, 41, 59); // slate-800 rengi
      doc.rect(0, 0, 210, 30, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text(
        "Rapor Detay" + (report.title ? `: ${report.title}` : ""),
        15,
        20
      );

      // İçerik alanı için üst kenar boşluğu
      let yPos = 40;

      // Bilgi kutusu
      doc.setFillColor(243, 244, 246); // bg-gray-100
      doc.setDrawColor(229, 231, 235); // border-gray-200
      doc.roundedRect(10, yPos, 190, 50, 3, 3, "FD");

      yPos += 10;

      // Rapor meta bilgileri
      doc.setFontSize(12);
      doc.setTextColor(17, 24, 39); // text-gray-900

      // Ana bilgilerin formatlanmış listesi - Ünik uyumluluk için ASCII karakterler kullanıldı
      const infos = [
        { label: "Rapor Gonderen", value: report.userName },
        {
          label: "Organizasyon",
          value: report.organizationName || "Belirtilmemis",
        },
        {
          label: "Tarih Araligi",
          value: `${format(new Date(report.startDate), "d MMMM", {
            locale: tr,
          })} - ${format(new Date(report.endDate), "d MMMM yyyy", {
            locale: tr,
          })}`,
        },
      ];

      // Rapor meta bilgilerini çift sütunlu olarak yerleştir
      for (let i = 0; i < infos.length; i++) {
        const info = infos[i];
        const col = i % 2;
        const row = Math.floor(i / 2);

        doc.setFontSize(10);
        doc.setTextColor(107, 114, 128); // text-gray-500
        doc.text(`${info.label}:`, 20 + col * 95, yPos + row * 15);

        doc.setFontSize(11);
        doc.setTextColor(17, 24, 39); // text-gray-900
        doc.text(info.value, 20 + col * 95, yPos + row * 15 + 7);
      }

      // Gönderim tarihi
      if (report.submittedAt) {
        yPos += 35;
        doc.setFontSize(10);
        doc.setTextColor(107, 114, 128); // text-gray-500
        doc.text("Gonderim Tarihi:", 20, yPos);

        doc.setFontSize(11);
        doc.setTextColor(17, 24, 39); // text-gray-900
        doc.text(
          format(new Date(report.submittedAt), "d MMMM yyyy, HH:mm", {
            locale: tr,
          }),
          20,
          yPos + 7
        );
      }

      // İçerik başlığı - Gönderim tarihinden sonra daha fazla boşluk bırak
      yPos += 30; // 20 yerine 30 yaparak daha fazla boşluk bırakıyorum

      // İçerik başlığı
      doc.setFillColor(30, 41, 59); // slate-800
      doc.setDrawColor(30, 41, 59); // slate-800
      doc.setTextColor(255, 255, 255);
      doc.roundedRect(10, yPos, 190, 10, 2, 2, "FD");
      doc.setFontSize(14);
      doc.text("Rapor Icerigi", 15, yPos + 7);

      // İçerik metni için arkaplan
      yPos += 15;
      doc.setFillColor(255, 255, 255); // white
      doc.setDrawColor(229, 231, 235); // border-gray-200

      // İçerik metni hazırla - özel karakterleri temizle
      let content = getFormattedContent()
        .replace(/###/g, "")
        .replace(/##/g, "")
        .replace(/\*\*(.*?)\*\*/g, "$1") // Kalın metinleri temizle
        .replace(/\*(.*?)\*/g, "$1"); // İtalik metinleri temizle

      // Türkçe karakterleri Latin benzerleriyle değiştir
      content = content
        .replace(/ç/g, "c")
        .replace(/Ç/g, "C")
        .replace(/ğ/g, "g")
        .replace(/Ğ/g, "G")
        .replace(/ı/g, "i")
        .replace(/İ/g, "I")
        .replace(/ö/g, "o")
        .replace(/Ö/g, "O")
        .replace(/ş/g, "s")
        .replace(/Ş/g, "S")
        .replace(/ü/g, "u")
        .replace(/Ü/g, "U");

      // İçeriği satırlara böl
      const splitContent = doc.splitTextToSize(content, 180);

      // İçerik kutusu için yükseklik hesapla (minimum 50mm, maksimum 180mm)
      const contentHeight = Math.min(
        Math.max(splitContent.length * 5 + 20, 50),
        180
      );
      doc.roundedRect(10, yPos, 190, contentHeight, 2, 2, "FD");

      // İçerik metnini yaz
      doc.setTextColor(31, 41, 55); // text-gray-800
      doc.setFontSize(11);
      doc.text(splitContent, 15, yPos + 10);

      // Görevler bölümü
      yPos += contentHeight + 15;

      // Sayfaya sığma kontrolü
      if (yPos > 240 && report.tasks && report.tasks.length > 0) {
        doc.addPage();
        yPos = 20;
      }

      // Görevler tablosu (varsa)
      if (report.tasks && report.tasks.length > 0) {
        // Görevler başlığı
        doc.setFillColor(30, 41, 59); // slate-800
        doc.setDrawColor(30, 41, 59); // slate-800
        doc.setTextColor(255, 255, 255);
        doc.roundedRect(10, yPos, 190, 10, 2, 2, "FD");
        doc.setFontSize(14);
        doc.text(`Gorevler (${report.tasks.length})`, 15, yPos + 7);

        yPos += 15;

        // Görev tablosu için veri hazırla - Türkçe karakterleri değiştir
        const tableRows = report.tasks.map((task) => {
          const title = task.title
            .replace(/ç/g, "c")
            .replace(/Ç/g, "C")
            .replace(/ğ/g, "g")
            .replace(/Ğ/g, "G")
            .replace(/ı/g, "i")
            .replace(/İ/g, "I")
            .replace(/ö/g, "o")
            .replace(/Ö/g, "O")
            .replace(/ş/g, "s")
            .replace(/Ş/g, "S")
            .replace(/ü/g, "u")
            .replace(/Ü/g, "U");

          let description = task.description
            ? task.description?.substring(0, 40) +
              (task.description?.length > 40 ? "..." : "")
            : "";

          description = description
            .replace(/ç/g, "c")
            .replace(/Ç/g, "C")
            .replace(/ğ/g, "g")
            .replace(/Ğ/g, "G")
            .replace(/ı/g, "i")
            .replace(/İ/g, "I")
            .replace(/ö/g, "o")
            .replace(/Ö/g, "O")
            .replace(/ş/g, "s")
            .replace(/Ş/g, "S")
            .replace(/ü/g, "u")
            .replace(/Ü/g, "U");

          return [
            title,
            description,
            format(new Date(task.startDate), "dd/MM/yyyy", { locale: tr }),
            format(new Date(task.endDate), "dd/MM/yyyy", { locale: tr }),
          ];
        });

        try {
          autoTable(doc, {
            startY: yPos,
            head: [["Gorev", "Aciklama", "Baslangic", "Bitis"]],
            body: tableRows,
            theme: "grid",
            headStyles: {
              fillColor: [241, 245, 249], // bg-slate-100
              textColor: [15, 23, 42], // text-slate-900
              fontStyle: "bold",
              halign: "left",
              cellPadding: 5,
            },
            styles: {
              fontSize: 9,
              cellPadding: 5,
              overflow: "linebreak",
              lineWidth: 0.1,
              font: "helvetica",
            },
            columnStyles: {
              0: { cellWidth: 55 }, // Görev başlığı
              1: { cellWidth: 75 }, // Açıklama
              2: { cellWidth: 30 }, // Başlangıç
              3: { cellWidth: 30 }, // Bitiş
            },
            alternateRowStyles: {
              fillColor: [248, 250, 252], // bg-slate-50
            },
          });
        } catch (error) {
          console.error("Tablo oluşturulurken hata:", error);
          doc.text("Gorevler tablosu yuklenirken hata olustu.", 15, yPos + 10);
        }
      }

      // Yönetici yorumu varsa
      if (report.managerComment) {
        // Yeni sayfa ekle
        doc.addPage();

        // Başlık
        doc.setFillColor(30, 41, 59); // slate-800
        doc.rect(0, 0, 210, 30, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);

        doc.text("Yonetici Notu", 15, 20);

        // Yorum kutusu için arkaplan
        let commentY = 40;

        // Standart renklendirme
        doc.setFillColor(243, 244, 246); // bg-gray-100
        doc.setDrawColor(229, 231, 235); // border-gray-200
        doc.roundedRect(10, commentY, 190, 80, 3, 3, "FD");

        // Yorum metni
        doc.setTextColor(17, 24, 39); // text-gray-900
        doc.setFontSize(11);

        // Yorum metnini Türkçe karakterleri değiştirerek hazırla
        let managerComment = report.managerComment
          .replace(/ç/g, "c")
          .replace(/Ç/g, "C")
          .replace(/ğ/g, "g")
          .replace(/Ğ/g, "G")
          .replace(/ı/g, "i")
          .replace(/İ/g, "I")
          .replace(/ö/g, "o")
          .replace(/Ö/g, "O")
          .replace(/ş/g, "s")
          .replace(/Ş/g, "S")
          .replace(/ü/g, "u")
          .replace(/Ü/g, "U");

        // Yorum metnini satırlara böl ve yaz
        const commentSplit = doc.splitTextToSize(managerComment, 180);
        doc.text(commentSplit, 15, commentY + 10);

        // İnceleme tarihi bilgisi (varsa)
        if (report.reviewedAt) {
          doc.setFontSize(9);
          doc.setTextColor(100, 116, 139); // text-slate-500

          let reviewText =
            format(new Date(report.reviewedAt), "d MMMM yyyy, HH:mm", {
              locale: tr,
            }) + " tarihinde incelenmistir.";

          reviewText = reviewText
            .replace(/ç/g, "c")
            .replace(/Ç/g, "C")
            .replace(/ğ/g, "g")
            .replace(/Ğ/g, "G")
            .replace(/ı/g, "i")
            .replace(/İ/g, "I")
            .replace(/ö/g, "o")
            .replace(/Ö/g, "O")
            .replace(/ş/g, "s")
            .replace(/Ş/g, "S")
            .replace(/ü/g, "u")
            .replace(/Ü/g, "U");

          doc.text(reviewText, 15, commentY + 95);
        }
      }

      // Sayfa altı bilgisi - Tüm sayfalara ekle
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);

        // Alt çizgi
        doc.setDrawColor(229, 231, 235); // border-gray-200
        doc.setLineWidth(0.5);
        doc.line(10, 280, 200, 280);

        // Alt bilgi metni
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139); // text-slate-500

        let footerText = `${report.organizationName || "Raporla"} - ${format(
          new Date(),
          "d MMMM yyyy",
          { locale: tr }
        )}`;

        // Türkçe karakterleri değiştir
        footerText = footerText
          .replace(/ç/g, "c")
          .replace(/Ç/g, "C")
          .replace(/ğ/g, "g")
          .replace(/Ğ/g, "G")
          .replace(/ı/g, "i")
          .replace(/İ/g, "I")
          .replace(/ö/g, "o")
          .replace(/Ö/g, "O")
          .replace(/ş/g, "s")
          .replace(/Ş/g, "S")
          .replace(/ü/g, "u")
          .replace(/Ü/g, "U");

        doc.text(footerText, 10, 287);

        // Sayfa numarası
        doc.text(`Sayfa ${i} / ${totalPages}`, 200, 287, { align: "right" });
      }

      // PDF'i indir
      doc.save(
        `${report.title || "Rapor"}-${format(new Date(), "yyyyMMdd")}.pdf`
      );

      // Başarılı bildirim
      toast.success("PDF başarıyla oluşturuldu ve indirildi.");
    } catch (error) {
      console.error("PDF oluşturulurken hata:", error);
      toast.error("PDF oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  return (
    <div className="space-y-4">
      {showControls && (
        <div className="flex justify-end mb-4">
          <Button variant="outline" onClick={exportToPDF}>
            <Download className="mr-2 h-4 w-4" />
            PDF İndir
          </Button>
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="h-2 bg-blue-500"></div>

        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold">
                {report.title || "Haftalık Rapor"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {format(new Date(report.startDate), "d MMMM", { locale: tr })} -{" "}
                {format(new Date(report.endDate), "d MMMM yyyy", {
                  locale: tr,
                })}
              </p>
            </div>
          </div>

          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>{getFormattedContent()}</ReactMarkdown>
          </div>

          {report.managerComment && (
            <div className="mt-8 p-4 rounded-lg border border-gray-200 bg-gray-50 text-gray-800">
              <div className="flex items-center gap-2 mb-2 font-medium">
                <FileText className="h-4 w-4" /> Yönetici Notu
              </div>
              <p>{report.managerComment}</p>
            </div>
          )}

          {report.submittedAt && (
            <div className="mt-4 text-sm text-muted-foreground">
              <p>
                {format(new Date(report.submittedAt), "d MMMM yyyy, HH:mm", {
                  locale: tr,
                })}{" "}
                tarihinde gönderildi
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {report.tasks && report.tasks.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4">Görevler</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {report.tasks.map((task) => (
              <Card key={task.id} className="overflow-hidden">
                <div className="h-1 bg-blue-500"></div>
                <CardContent className="p-4">
                  <h4 className="font-medium">{task.title}</h4>
                  {task.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center mt-2 text-xs">
                    <span className="text-muted-foreground">
                      {format(new Date(task.startDate), "d MMM", {
                        locale: tr,
                      })}{" "}
                      -{" "}
                      {format(new Date(task.endDate), "d MMM", { locale: tr })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
