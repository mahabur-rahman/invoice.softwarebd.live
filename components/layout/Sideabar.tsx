"use client";

import dynamic from "next/dynamic";
import { Layout, Menu } from "antd";
import { menuItems } from "./menuItems";

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}

const SidebarContent = ({ collapsed }: SidebarProps) => (
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
      defaultSelectedKeys={["1"]}
      defaultOpenKeys={["sub1"]}
      style={{ height: "100%", borderRight: 0 }}
      items={menuItems}
    />
  </Sider>
);

const Sidebar = dynamic(() => Promise.resolve(SidebarContent), {
  ssr: false,
});

export default Sidebar;
