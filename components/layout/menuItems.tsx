import Link from "next/link";
import { FaHome } from "react-icons/fa";
import { FiBriefcase, FiFileText, FiSettings, FiUsers } from "react-icons/fi";
import { MdOutlineReceiptLong } from "react-icons/md";
import type { MenuProps } from "antd";

type MenuOptions = {
  isAdmin?: boolean;
};

export const getMenuItems = ({
  isAdmin = false,
}: MenuOptions = {}): MenuProps["items"] => {
  if (isAdmin) {
    return [
      {
        key: "1",
        icon: <FaHome size={18} />,
        label: <Link href="/dashboard">Dashboard</Link>,
      },
      {
        key: "701",
        icon: <FiUsers size={18} />,
        label: <Link href="/admin/users">Users</Link>,
      },
      {
        key: "702",
        icon: <MdOutlineReceiptLong size={18} />,
        label: <Link href="/admin/invoices">Invoices</Link>,
      },
    ];
  }

  return [
    {
      key: "1",
      icon: <FaHome size={18} />,
      label: <Link href="/dashboard">Dashboard</Link>,
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
};
