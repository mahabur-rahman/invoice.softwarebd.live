import { create } from "zustand";
import { persist } from "zustand/middleware";

type UserStore = {
  userId: string | null;
  setUserId: (id: string | null) => void;
  clearUser: () => void;
};

export const useUserStore = create(
  persist<UserStore>(
    (set) => ({
      userId: null,

      setUserId: (id) => set({ userId: id }),

      clearUser: () => set({ userId: null }),
    }),
    {
      name: "user-storage",
    }
  )
);
