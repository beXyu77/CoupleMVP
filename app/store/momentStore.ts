import { create } from "zustand";

export type Moment = {
  id: string;
  content: string;
  imageUri?: string;
  createdAt: number;
  author: "me" | "partner";

  likedByMe: boolean;
  likeCount: number;
};

type MomentState = {
  moments: Moment[];
  addMoment: (content: string, imageUri?: string) => void;
  removeMoment: (id: string) => void;
  toggleLike: (id: string) => void;
};

export const useMomentsStore = create<MomentState>((set) => ({
  moments: [
    {
      id: "m1",
      content: "今天一起把情侣 App 又推进了一大步。",
      createdAt: Date.now() - 1000 * 60 * 60 * 6,
      author: "me",
      likedByMe: false,
      likeCount: 0,
    },
  ],

  addMoment: (content, imageUri) =>
    set((s) => ({
      moments: [
        {
          id: `m_${Date.now()}`,
          content: content.trim(),
          imageUri,
          createdAt: Date.now(),
          author: "me",
          likedByMe: false,
          likeCount: 0,
        },
        ...s.moments,
      ],
    })),

  removeMoment: (id) =>
    set((s) => ({ moments: s.moments.filter((m) => m.id !== id) })),

  toggleLike: (id) =>
    set((s) => ({
      moments: s.moments.map((m) => {
        if (m.id !== id) return m;
        const nextLiked = !m.likedByMe;
        return {
          ...m,
          likedByMe: nextLiked,
          likeCount: Math.max(0, m.likeCount + (nextLiked ? 1 : -1)),
        };
      }),
    })),
}));