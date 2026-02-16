"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import { Layout as AntLayout } from "antd";
import Sidebar from "@/components/layout/Sideabar";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/store/userStore";

const { Content } = AntLayout;

const Layout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const accessToken = useUserStore((state) => state.accessToken);
  const hasHydrated = useUserStore((state) => state.hasHydrated);
  const isAuthed = Boolean(accessToken);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== "user") return;
      useUserStore.persist.rehydrate();
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", useUserStore.persist.rehydrate);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", useUserStore.persist.rehydrate);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hasHydrated) return;
    if (!isAuthed) {
      router.replace("/login");
    }
  }, [hasHydrated, isAuthed, router]);

  if (!hasHydrated) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthed) {
    return null;
  }

  return (
    <div className="h-screen w-full overflow-hidden flex print:h-auto print:overflow-visible print:block">
      <div className="print:hidden">
        <Sidebar collapsed={collapsed} />
      </div>

      <div className="flex flex-col flex-1 h-full print:h-auto">
        <div className="print:hidden">
          <Header collapsed={collapsed} setCollapsed={setCollapsed} />
        </div>

        <div className="flex-1 overflow-hidden relative print:overflow-visible print:static">
          <Content
            className="absolute inset-0 overflow-y-auto p-6 bg-white print:static print:inset-auto print:overflow-visible print:p-0"
            style={{
              borderRadius: 8,
              margin: "0",
            }}
          >
            {children}
          </Content>
        </div>
      </div>
    </div>
  );
};

export default Layout;
