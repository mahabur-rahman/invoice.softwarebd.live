import { useUserStore } from "@/lib/store/userStore";

export const logout = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("user");
  useUserStore.getState().clearUser();
};
