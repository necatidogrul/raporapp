import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Task } from "@/types/task";

interface TaskState {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setTasks: (tasks: Task[]) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: [],
      addTask: (task) =>
        set((state) => ({
          tasks: [...state.tasks, task],
        })),
      updateTask: (id, updatedTask) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updatedTask } : task
          ),
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),
      setTasks: (tasks) => set({ tasks }),
    }),
    {
      name: "tasks-storage",
      // Task içindeki date nesneleri için özel işleyici ekleyerek doğru şekilde saklanmasını sağlıyoruz
      partialize: (state) => ({
        tasks: state.tasks.map((task) => ({
          ...task,
          startDate:
            task.startDate instanceof Date
              ? task.startDate.toISOString()
              : task.startDate,
          endDate:
            task.endDate instanceof Date
              ? task.endDate.toISOString()
              : task.endDate,
          dueDate:
            task.dueDate instanceof Date
              ? task.dueDate.toISOString()
              : task.dueDate,
          createdAt:
            task.createdAt instanceof Date
              ? task.createdAt.toISOString()
              : task.createdAt,
          updatedAt:
            task.updatedAt instanceof Date
              ? task.updatedAt.toISOString()
              : task.updatedAt,
        })),
      }),
      // LocalStorage'dan yüklenen veriler için tarihleri tekrar Date nesnelerine dönüştürüyoruz
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.tasks = state.tasks.map((task) => ({
            ...task,
            startDate: new Date(task.startDate),
            endDate: new Date(task.endDate),
            dueDate: new Date(task.dueDate),
            createdAt: new Date(task.createdAt),
            updatedAt: new Date(task.updatedAt),
          }));
        }
      },
    }
  )
);
