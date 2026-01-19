import { create } from "zustand";

type ProfileState = {
  myName: string;
  myAvatarUri?: string;

  partnerName?: string; // undefined = not bound

  setMyName: (name: string) => void;
  setMyAvatarUri: (uri?: string) => void;

  bindPartner: (name: string) => void;
  unbindPartner: () => void;
};

export const useProfileStore = create<ProfileState>((set) => ({
  myName: "Ruthie",
  myAvatarUri: undefined,

  partnerName: undefined,

  setMyName: (name) => set(() => ({ myName: name })),
  setMyAvatarUri: (uri) => set(() => ({ myAvatarUri: uri })),

  bindPartner: (name) =>
    set(() => ({
      partnerName: name.trim(),
    })),

  unbindPartner: () =>
    set(() => ({
      partnerName: undefined,
    })),
}));