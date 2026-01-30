export type StoredUser = {
  accessToken?: string;
  refreshToken?: string;
  userId?: string;
  user?: {
    _id?: string;
    email?: string;
    name?: string | null;
    picture?: string | null;
  };
};

const STORAGE_KEY = "user";

export const readStoredUser = (): StoredUser | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
};

export const writeStoredUser = (user: StoredUser | null) => {
  if (typeof window === "undefined") return;
  if (!user) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
};

export const mergeStoredUser = (patch: Partial<StoredUser>) => {
  const current = readStoredUser() ?? {};
  const next: StoredUser = {
    ...current,
    ...patch,
    user: {
      ...(current.user ?? {}),
      ...(patch.user ?? {}),
    },
  };
  writeStoredUser(next);
  return next;
};

export const getUserInitials = (user?: StoredUser["user"] | null) => {
  const nameSource = user?.name?.trim();
  const emailSource = user?.email?.trim();
  const source = nameSource || emailSource || "";
  if (!source) return "U";
  const cleaned = source.includes("@") ? source.split("@")[0] : source;
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 1).toUpperCase();
  }
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
};
