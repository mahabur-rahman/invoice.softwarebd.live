import Link from "next/link";
import { FaHome } from "react-icons/fa";
import { FiFileText, FiSettings, FiUsers } from "react-icons/fi";
import { MdOutlineReceiptLong } from "react-icons/md";
import type { MenuProps } from "antd";

export const menuItems: MenuProps["items"] = [
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
        label: <Link href="/generate-invoice">Create Invoice</Link>,
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
];
