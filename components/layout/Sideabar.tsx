"use client";

import dynamic from "next/dynamic";
import { Layout, Menu } from "antd";
import { menuItems } from "./menuItems";
import { usePathname } from "next/navigation";
import React from "react";

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}

const SidebarContent = ({ collapsed }: SidebarProps) => {
  const pathname = usePathname();

  const selectedKey = React.useMemo(() => {
    if (!pathname) return "1";
    if (pathname.startsWith("/generate-invoice")) return "102";
    if (pathname.startsWith("/invoices")) return "101";
    if (pathname.startsWith("/clients")) return "3";
    if (pathname.startsWith("/my-business")) return "4";
    if (pathname.startsWith("/settings/invoice")) return "5";
    if (pathname.startsWith("/settings")) return "6";
    if (pathname.startsWith("/dashboard")) return "1";
    return "1";
  }, [pathname]);

  const derivedOpenKeys = React.useMemo(() => {
    if (selectedKey === "101" || selectedKey === "102") return ["2"];
    return [];
  }, [selectedKey]);

  const [openKeys, setOpenKeys] = React.useState<string[]>(derivedOpenKeys);

  React.useEffect(() => {
    setOpenKeys(derivedOpenKeys);
  }, [derivedOpenKeys]);

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
        openKeys={openKeys}
        onOpenChange={(keys) => {
          const latest = keys[keys.length - 1];
          if (!latest) {
            setOpenKeys([]);
            return;
          }
          setOpenKeys([latest]);
        }}
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
