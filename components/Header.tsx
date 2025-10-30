"use client";

import Link from "next/link";

const Header = () => {
  return (
    <header className="w-full bg-white shadow-md py-3 px-6 flex items-center justify-between">
      <h1 className="text-xl font-bold text-gray-800">My Dashboard</h1>

      <nav className="flex items-center gap-6">
        <Link href="/" className="text-gray-700 hover:text-blue-600 transition">
          Home
        </Link>
        <Link href="/profile" className="text-gray-700 hover:text-blue-600 transition">
          Profile
        </Link>
        <button className="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition">
          Logout
        </button>
      </nav>
    </header>
  );
};

export default Header;
