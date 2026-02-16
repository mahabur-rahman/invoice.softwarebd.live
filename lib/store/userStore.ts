import { create } from "zustand";
import { persist, type PersistStorage, type StorageValue } from "zustand/middleware";
import { UserRole } from "@/lib/constants/constants";

export type AuthUser = {
  _id: string;
  email: string;
  name?: string | null;
  picture?: string | null;
  role?: UserRole | null;
};

type LegacyStoredUser = {
  accessToken?: string;
  refreshToken?: string;
  userId?: string;
  user?: AuthUser;
  role?: UserRole;
};

type UserStoreState = {
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  user: AuthUser | null;
  role: UserRole | null;
  hasHydrated: boolean;
  setAuth: (payload: {
    accessToken: string;
    refreshToken: string;
    userId?: string | null;
    user?: AuthUser | null;
    role?: UserRole | null;
  }) => void;
  setUser: (user: AuthUser | null) => void;
  setRole: (role: UserRole | null) => void;
  clearUser: () => void;
  setHasHydrated: (value: boolean) => void;
};

type UserStorePersistedState = Pick<
  UserStoreState,
  "accessToken" | "refreshToken" | "userId" | "user" | "role"
>;

const initialState = {
  accessToken: null,
  refreshToken: null,
  userId: null,
  user: null,
  role: null,
  hasHydrated: false,
};

const isLegacyStoredUser = (value: unknown): value is LegacyStoredUser => {
  if (!value || typeof value !== "object") return false;
  return (
    "accessToken" in value ||
    "refreshToken" in value ||
    "userId" in value ||
    "user" in value
  );
};

const toPersistedState = (legacy: LegacyStoredUser): UserStorePersistedState => {
  const user = legacy.user ?? null;
  return {
    accessToken: legacy.accessToken ?? null,
    refreshToken: legacy.refreshToken ?? null,
    userId: legacy.userId ?? user?._id ?? null,
    user,
    role: legacy.role ?? user?.role ?? null,
  };
};

const storage: PersistStorage<UserStorePersistedState> = {
  getItem: (name) => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(name);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as
        | StorageValue<UserStorePersistedState>
        | LegacyStoredUser;
      if (parsed && typeof parsed === "object" && "state" in parsed) {
        return parsed as StorageValue<UserStorePersistedState>;
      }
      if (isLegacyStoredUser(parsed)) {
        return { state: toPersistedState(parsed), version: 1 };
      }
    } catch {
      return null;
    }
    return null;
  },
  setItem: (name, value) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name) => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(name);
  },
};

export const useUserStore = create<UserStoreState>()(
  persist(
    (set) => ({
      ...initialState,
      setAuth: (payload) => {
        const resolvedUser = payload.user ?? null;
        const resolvedUserId = payload.userId ?? resolvedUser?._id ?? null;
        const resolvedRole = payload.role ?? resolvedUser?.role ?? null;
        set({
          accessToken: payload.accessToken ?? null,
          refreshToken: payload.refreshToken ?? null,
          userId: resolvedUserId,
          user: resolvedUser,
          role: resolvedRole,
          hasHydrated: true,
        });
      },
      setUser: (user) =>
        set((state) => ({
          user,
          userId: user?._id ?? state.userId,
          role: user?.role ?? state.role ?? null,
        })),
      setRole: (role) => set({ role }),
      clearUser: () => set({ ...initialState, hasHydrated: true }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "user",
      version: 1,
      storage,
      partialize: (state): UserStorePersistedState => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        userId: state.userId,
        user: state.user,
        role: state.role,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as UserStorePersistedState),
        hasHydrated: current.hasHydrated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
