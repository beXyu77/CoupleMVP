import { create } from "zustand";

export type Note = {
  id: string;
  content: string;
  createdAt: number;
  author: "me" | "partner";
};

type NotesState = {
  notes: Note[];
  addNote: (content: string) => void;
};

export const useNotesStore = create<NotesState>((set) => ({
  notes: [
    {
      id: "n1",
      content: "今天也要温柔一点点。",
      createdAt: Date.now() - 1000 * 60 * 60 * 3,
      author: "partner",
    },
  ],
  addNote: (content) =>
    set((s) => ({
      notes: [
        { id: `n_${Date.now()}`, content: content.trim(), createdAt: Date.now(), author: "me" },
        ...s.notes,
      ],
    })),
}));