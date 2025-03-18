import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowDownToLine, Eye, Check } from "lucide-react";
import { formatDate } from "@/lib/utils";

export type Report = {
  id: string;
  userId: string;
  userName: string;
  content: string;
  status: "READ" | "UNREAD";
  createdAt: string;
  readAt?: string;
};

export const columns: ColumnDef<Report>[] = [
  {
    accessorKey: "userName",
    header: "Gönderen",
  },
  {
    accessorKey: "createdAt",
    header: "Tarih",
    cell: ({ row }) => formatDate(row.getValue("createdAt")),
  },
  {
    accessorKey: "status",
    header: "Durum",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={status === "READ" ? "secondary" : "default"}>
          {status === "READ" ? "Okundu" : "Okunmadı"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const report = row.original;

      return (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <ArrowDownToLine className="h-4 w-4" />
          </Button>
          {report.status === "UNREAD" && (
            <Button variant="ghost" size="icon">
              <Check className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    },
  },
];
