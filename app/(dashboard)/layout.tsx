"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import { Layout as AntLayout } from "antd";
import Sidebar from "@/components/layout/Sideabar";
import { useRouter } from "next/navigation";

const { Content } = AntLayout;

const readAuthFromStorage = () => {
  if (typeof window === "undefined") return false;
  try {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    return Boolean(user?.accessToken);
  } catch {
    return false;
  }
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncAuth = () => {
      setIsAuthed(readAuthFromStorage());
      setAuthChecked(true);
    };

    syncAuth();

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== "user") return;
      syncAuth();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", syncAuth);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", syncAuth);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!authChecked) return;
    if (!isAuthed) {
      router.replace("/login");
    }
  }, [authChecked, isAuthed, router]);

  if (!authChecked) {
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
