import Link from "next/link";
import { FaHome } from "react-icons/fa";
import { FiBriefcase, FiFileText, FiSettings, FiUsers } from "react-icons/fi";
import { MdOutlineReceiptLong } from "react-icons/md";
import type { MenuProps } from "antd";

export const menuItems: MenuProps["items"] = [
  {
    key: "1",
    icon: <FaHome size={18} />,
    label: <Link href="/dashboard">Home</Link>,
  },
  {
    key: "2",
    icon: <FiFileText size={18} />,
    label: "Invoice",
    children: [
      {
        key: "101",
        icon: <MdOutlineReceiptLong size={16} />,
        label: <Link href="/invoices">Invoices</Link>,
      },
      {
        key: "102",
        icon: <FiFileText size={16} />,
        label: <Link href="/generate-invoice">Create Invoice</Link>,
      },
    ],
  },
  {
    key: "3",
    icon: <FiUsers size={18} />,
    label: <Link href="/clients">Clients</Link>,
  },
  {
    key: "4",
    icon: <FiBriefcase size={18} />,
    label: <Link href="/my-business">My Business</Link>,
  },
  {
    key: "5",
    icon: <MdOutlineReceiptLong size={18} />,
    label: <Link href="/settings/invoice">Invoice Settings</Link>,
  },
  {
    key: "6",
    icon: <FiSettings size={18} />,
    label: <Link href="/settings">Settings</Link>,
  },
];
