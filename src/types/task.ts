export type TaskStatus = "IN_PROGRESS" | "COMPLETED" | "PENDING";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Task {
  id: string;
  userId: string;
  userName: string;
  managerId: string;
  organizationId: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  dueDate: Date;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: Date;
  updatedAt: Date;
  weeklyReport?: boolean;
  weekNumber?: number;
}

export interface TaskStore {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setTasks: (tasks: Task[]) => void;
}
