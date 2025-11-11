"use client";

import { FiMenu, FiX } from "react-icons/fi";
import Link from "next/link";
import { Layout } from "antd";

const { Header: AntHeader } = Layout;

interface HeaderProps {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

const Header = ({ collapsed, setCollapsed }: HeaderProps) => {
  return (
    <AntHeader
      className="flex items-center justify-between bg-white border-b shadow-sm px-6"
      style={{ height: 64 }}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-md hover:bg-gray-100 transition"
        >
          {collapsed ? <FiMenu size={20} /> : <FiX size={20} />}
        </button>
        <h1 className="text-lg font-semibold text-gray-800">My Dashboard</h1>
      </div>

      <nav className="flex items-center gap-6">
        <Link href="/" className="text-gray-700 hover:text-blue-600 transition">
          Home
        </Link>
        <Link
          href="/profile"
          className="text-gray-700 hover:text-blue-600 transition"
        >
          Profile
        </Link>
        <button className="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition">
          Logout
        </button>
      </nav>
    </AntHeader>
  );
};

export default Header;
