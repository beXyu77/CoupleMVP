import { create } from "zustand";

export type Anniversary = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
};

type DayState = {
  startDate: string;
  anniversaries: Anniversary[];
  addAnniversary: (title: string, date: string) => void;
  removeAnniversary: (id: string) => void;
};

export const useDaysStore = create<DayState>((set) => ({
  startDate: "2025-08-01",
  anniversaries: [
    { id: "a1", title: "在一起纪念日", date: "2025-08-01" },
    { id: "a2", title: "下一次见面", date: "2026-02-14" },
  ],

  addAnniversary: (title, date) =>
    set((s) => ({
      anniversaries: [
        { id: `a_${Date.now()}`, title: title.trim(), date },
        ...s.anniversaries,
      ],
    })),

  removeAnniversary: (id) =>
    set((s) => ({
      anniversaries: s.anniversaries.filter((a) => a.id !== id),
    })),
}));
