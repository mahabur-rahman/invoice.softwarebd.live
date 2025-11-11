"use client";

import React from "react";
import {
    FiDollarSign,
    FiUsers,
    FiFileText,
    FiTrendingUp,
} from "react-icons/fi";
import DashboardCharts from "./DashboardCharts";

const DashboardMain = () => {
    return (
        <div className="w-full h-full flex flex-col overflow-y-auto">
            {/* ===== Top Stats ===== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
                {[
                    {
                        title: "Total Sales",
                        value: "$12,450",
                        icon: <FiDollarSign size={26} />,
                        color: "from-blue-500 to-indigo-500",
                    },
                    {
                        title: "New Clients",
                        value: "243",
                        icon: <FiUsers size={26} />,
                        color: "from-green-400 to-emerald-500",
                    },
                    {
                        title: "Pending Invoices",
                        value: "18",
                        icon: <FiFileText size={26} />,
                        color: "from-yellow-400 to-orange-500",
                    },
                    {
                        title: "Revenue Growth",
                        value: "+12.4%",
                        icon: <FiTrendingUp size={26} />,
                        color: "from-pink-500 to-rose-500",
                    },
                ].map((item, i) => (
                    <div
                        key={i}
                        className={`flex items-center justify-between bg-linear-to-r ${item.color} text-white rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition transform hover:-translate-y-1 p-4`}
                    >
                        <div>
                            <p className="text-sm opacity-90">{item.title}</p>
                            <h2 className="text-3xl font-bold mt-1">{item.value}</h2>
                        </div>
                        <div className="bg-white/20 p-3 rounded-lg">{item.icon}</div>
                    </div>
                ))}
            </div>

            {/* ===== Charts Section ===== */}
            <DashboardCharts />

            {/* ===== Table Section ===== */}
            <div className="flex-1 p-4">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 h-full overflow-auto">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Recent Invoices
                    </h3>
                    <table className="w-full text-sm text-gray-700 border-t border-gray-200">
                        <thead className="bg-linear-to-r from-blue-500 to-indigo-500 text-white">
                            <tr>
                                <th className="text-left p-2">#</th>
                                <th className="text-left p-2">Client</th>
                                <th className="text-left p-2">Amount</th>
                                <th className="text-left p-2">Status</th>
                                <th className="text-left p-2">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                ["#INV001", "John Doe", "$520", "Paid", "11 Nov 2025"],
                                ["#INV002", "Sarah Smith", "$320", "Pending", "10 Nov 2025"],
                                ["#INV003", "Michael Lee", "$1,200", "Overdue", "08 Nov 2025"],
                                ["#INV004", "Emily Davis", "$780", "Paid", "07 Nov 2025"],
                                ["#INV005", "David Kim", "$950", "Pending", "06 Nov 2025"],
                            ].map(([id, client, amount, status, date], i) => (
                                <tr
                                    key={i}
                                    className="border-b border-gray-200 hover:bg-blue-50 transition duration-200"
                                >
                                    <td className="p-2">{id}</td>
                                    <td className="p-2 font-medium">{client}</td>
                                    <td className="p-2">{amount}</td>
                                    <td className="p-2">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${status === "Paid"
                                                    ? "bg-green-100 text-green-700 border border-gray-200"
                                                    : status === "Pending"
                                                        ? "bg-yellow-100 text-yellow-700 border border-gray-200"
                                                        : "bg-red-100 text-red-700 border border-gray-200"
                                                }`}
                                        >
                                            {status}
                                        </span>
                                    </td>
                                    <td className="p-2 text-gray-500">{date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardMain;
