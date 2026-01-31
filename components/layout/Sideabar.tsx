"use client";

import dynamic from "next/dynamic";
import { Layout, Menu } from "antd";
import { getMenuItems } from "./menuItems";
import { usePathname } from "next/navigation";
import React from "react";
import { useUserStore } from "@/lib/store/userStore";
import { UserRole } from "@/lib/constants/constants";

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}

const SidebarContent = ({ collapsed }: SidebarProps) => {
  const pathname = usePathname();
  const role = useUserStore((state) => state.role);
  const isAdmin = role === UserRole.ADMIN || role === "ADMIN";
  const menuItems = React.useMemo(
    () => getMenuItems({ isAdmin }),
    [isAdmin]
  );

  const selectedKey = React.useMemo(() => {
    if (!pathname) return "1";
    if (pathname.startsWith("/admin/users")) return "701";
    if (pathname.startsWith("/admin/invoices")) return "702";
    if (pathname.startsWith("/dashboard")) return "1";
    return "1";
  }, [pathname]);

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      trigger={null}
      width={220}
      style={{
        background: "#fff",
        boxShadow: "2px 0 6px rgba(0,0,0,0.05)",
        borderRight: "1px solid #f0f0f0",
      }}
      className="min-h-screen"
    >
      <div
        className="flex items-center justify-center h-16 text-lg font-semibold text-gray-800 border-b border-gray-200"
        style={{ whiteSpace: "nowrap" }}
      >
        {!collapsed ? "Sellyx" : "S"}
      </div>

      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        style={{ height: "100%", borderRight: 0 }}
        items={menuItems}
      />
    </Sider>
  );
};

const Sidebar = dynamic(() => Promise.resolve(SidebarContent), {
  ssr: false,
});

export default Sidebar;
