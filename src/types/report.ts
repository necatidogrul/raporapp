import { Task } from "./task";

export type ReportStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";

export interface Report {
  id: string;
  userId: string;
  userName: string;
  managerId: string;
  managerName?: string;
  organizationId: string;
  organizationName: string;
  title: string;
  description: string;
  content?: string;
  startDate: Date;
  endDate: Date;
  status: ReportStatus;
  tasks: Task[];
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  reviewedAt?: Date;
  managerComment?: string;
  firebaseId?: string;
}

export interface ReportStore {
  reports: Report[];
  addReport: (report: Report) => void;
  updateReport: (id: string, report: Partial<Report>) => void;
  deleteReport: (id: string) => void;
  setReports: (reports: Report[]) => void;
  addTaskToReport: (reportId: string, task: Task) => void;
  removeTaskFromReport: (reportId: string, taskId: string) => void;
}
