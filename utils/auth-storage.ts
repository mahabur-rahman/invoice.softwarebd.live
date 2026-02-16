import type { AuthUser } from "@/lib/store/userStore";

export const getUserInitials = (user?: AuthUser | null) => {
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
