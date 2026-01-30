import { useUserStore } from "@/lib/store/userStore";
import { writeStoredUser } from "@/utils/auth-storage";

export const logout = () => {
  if (typeof window === "undefined") return;
  writeStoredUser(null);
  useUserStore.getState().clearUser();
};
