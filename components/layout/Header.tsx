"use client";

import { MdMenuOpen } from "react-icons/md";
import { Layout, Dropdown, Avatar } from "antd";
import type { MenuProps } from "antd";
import { FiLogOut } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { logout } from "@/utils/auth";
import { useAuthUser } from "@/lib/hooks/useAuthUser";
import { getUserInitials } from "@/utils/auth-storage";

const { Header: AntHeader } = Layout;

interface HeaderProps {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

const Header = ({ collapsed, setCollapsed }: HeaderProps) => {
  const router = useRouter();
  const { user } = useAuthUser();
  const initials = getUserInitials(user);
  const handleLogout = () => {
    logout();
    router.push("/login");
  };
  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <button className="flex items-center gap-2 text-red-500 hover:text-red-600"
          onClick={handleLogout}

        >
          <FiLogOut size={16} />
          Logout
        </button>
      ),
    },
  ];

  return (
    <AntHeader
      className="flex items-center justify-between bg-white! border-b border-gray-200 shadow-sm px-4!"
      style={{ height: 64 }}
    >
      {/* Left side: toggle + title */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <MdMenuOpen
            size={24}
            className={`transition-transform ${collapsed ? "rotate-180 text-blue-600" : "text-gray-700"
              }`}
          />
        </button>
        <h1 className="text-xl font-semibold text-gray-800">My Dashboard</h1>
      </div>

      {/* Right side: avatar dropdown */}
      <Dropdown menu={{ items }} placement="bottomRight" arrow>
        <Avatar
          size={40}
          className="cursor-pointer hover:opacity-90 transition"
          src={user?.picture || undefined}
          style={!user?.picture ? { backgroundColor: "#0f172a" } : undefined}
        >
          {!user?.picture ? initials : null}
        </Avatar>
      </Dropdown>
    </AntHeader>
  );
};

export default Header;
