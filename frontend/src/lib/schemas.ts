import { z } from "zod";
import { TaskStatus, TaskPriority } from "@/types/task";

export const taskSchema = z.object({
  title: z.string().min(3, "Başlık en az 3 karakter olmalıdır"),
  description: z.string().min(10, "Açıklama en az 10 karakter olmalıdır"),
  organizationId: z.string().min(1, "Lütfen bir organizasyon seçin"),
  startDate: z.date(),
  endDate: z.date(),
  status: z.custom<TaskStatus>(),
  priority: z.custom<TaskPriority>(),
  weeklyReport: z.boolean().optional().default(false),
  weekNumber: z.number().optional(),
});

export type TaskFormValues = z.infer<typeof taskSchema>;

// Haftalık rapor şeması
export const weeklyReportSchema = z.object({
  weekNumber: z.number(),
  startDate: z.date(),
  endDate: z.date(),
  organizationId: z.string(),
  userId: z.string(),
  tasks: z.array(taskSchema),
  status: z.enum(["DRAFT", "SUBMITTED", "APPROVED", "REJECTED"]),
  managerComment: z.string().optional(),
  submittedAt: z.date().optional(),
  approvedAt: z.date().optional(),
});

export type WeeklyReportFormValues = z.infer<typeof weeklyReportSchema>;
