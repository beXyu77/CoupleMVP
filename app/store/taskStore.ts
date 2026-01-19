import { create } from "zustand";

export type TaskType = "care" | "talk" | "memory" | "date" | "surprise";

export type Task = {
  id: string;
  title: string;
  type: TaskType;
  date: string; // YYYY-MM-DD
  myDone: boolean;
  partnerDone: boolean;
  createdAt: number;
};

type TasksState = {
  tasks: Task[];
  addTask: (title: string, date: string, type: TaskType) => void;
  toggleMyDone: (id: string) => void;
  // 临时：模拟对方确认
  togglePartnerDone: (id: string) => void;
  removeTask: (id: string) => void;
};

const todayStr = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export const useTasksStore = create<TasksState>((set) => ({
  tasks: [
  {
    id: "t1",
    title: "给对方发一句夸夸",
    type: "care",
    date: todayStr(),
    myDone: false,
    partnerDone: false,
    createdAt: Date.now(),
  },
  {
    id: "t2",
    title: "一起选一张照片放进时光轴",
    type: "memory",
    date: todayStr(),
    myDone: true,
    partnerDone: false,
    createdAt: Date.now(),
  },
],

  addTask: (title, date, type) =>
  set((s) => ({
    tasks: [
      {
        id: `t_${Date.now()}`,
        title: title.trim(),
        type,
        date,
        myDone: false,
        partnerDone: false,
        createdAt: Date.now(),
      },
      ...s.tasks,
    ],
  })),

  toggleMyDone: (id) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, myDone: !t.myDone } : t)),
    })),

  togglePartnerDone: (id) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id ? { ...t, partnerDone: !t.partnerDone } : t
      ),
    })),

  removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
}));


