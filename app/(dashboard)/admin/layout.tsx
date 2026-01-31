"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/store/userStore";
import { UserRole } from "@/lib/constants/constants";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const role = useUserStore((state) => state.role);
  const hasHydrated = useUserStore((state) => state.hasHydrated);
  const isAdmin = role === UserRole.ADMIN || role === "ADMIN";

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAdmin) {
      router.replace("/dashboard");
    }
  }, [hasHydrated, isAdmin, router]);

  if (!hasHydrated) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-center shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
            Restricted
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">
            Admin access required
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            You do not have permission to view this section.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminLayout;
