import Link from "next/link";
import { FaHome } from "react-icons/fa";
import { FiUsers } from "react-icons/fi";
import { MdOutlineReceiptLong } from "react-icons/md";
import type { MenuProps } from "antd";

type MenuOptions = {
  isAdmin?: boolean;
};

export const getMenuItems = ({
  isAdmin = false,
}: MenuOptions = {}): MenuProps["items"] => {
  const items: MenuProps["items"] = [
    {
      key: "1",
      icon: <FaHome size={18} />,
      label: <Link href="/dashboard">Dashboard</Link>,
    },
  ];

  if (isAdmin) {
    items.push(
      {
        key: "701",
        icon: <FiUsers size={18} />,
        label: <Link href="/admin/users">Users</Link>,
      },
      {
        key: "702",
        icon: <MdOutlineReceiptLong size={18} />,
        label: <Link href="/admin/invoices">Invoices</Link>,
      }
    );
  }

  return items;
};
