"use client";

import Link from "next/link";
import { Layout, Menu } from "antd";
import { FaHome } from "react-icons/fa";
import { FiFileText, FiSettings, FiUsers } from "react-icons/fi";
import { MdOutlineReceiptLong } from "react-icons/md";

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar = ({ collapsed }: SidebarProps) => {
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
        defaultSelectedKeys={["1"]}
        defaultOpenKeys={["sub1"]}
        style={{ height: "100%", borderRight: 0 }}
        items={[
          {
            key: "1",
            icon: <FaHome size={18} />,
            label: <Link href="/">Home</Link>,
          },
          {
            key: "sub1",
            icon: <FiFileText size={18} />,
            label: "Invoice",
            children: [
              {
                key: "2",
                icon: <MdOutlineReceiptLong size={16} />,
                label: <Link href="/invoices">Invoices</Link>,
              },
              {
                key: "3",
                icon: <FiFileText size={16} />,
                label: <Link href="/create-invoice">Create Invoice</Link>,
              },
              {
                key: "4",
                icon: <FiUsers size={16} />,
                label: <Link href="/clients">Clients</Link>,
              },
            ],
          },
          {
            key: "5",
            icon: <FiSettings size={18} />,
            label: <Link href="/settings">Settings</Link>,
          },
        ]}
      />
    </Sider>
  );
};

export default Sidebar;
