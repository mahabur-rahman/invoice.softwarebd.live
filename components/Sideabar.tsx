"use client";

import { useState } from "react";
import Link from "next/link";
import { FiMenu, FiX, FiFileText, FiSettings } from "react-icons/fi";
import { FaHome } from "react-icons/fa";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside
      className={`${
        isOpen ? "w-64" : "w-16"
      } bg-white shadow-md h-screen sticky top-0 transition-all duration-300 flex flex-col`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h2 className={`text-lg font-semibold ${!isOpen && "hidden"}`}>Menu</h2>
        <button
          className="p-2 hover:bg-gray-100 rounded-lg"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col mt-4">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
        >
          <FaHome size={20} />
          <span className={`${!isOpen && "hidden"}`}>Home</span>
        </Link>
        <Link
          href="/generate-invoice"
          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
        >
          <FiFileText size={20} />
          <span className={`${!isOpen && "hidden"}`}>Invoice Generator</span>
        </Link>

        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
        >
          <FiSettings size={20} />
          <span className={`${!isOpen && "hidden"}`}>Settings</span>
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
