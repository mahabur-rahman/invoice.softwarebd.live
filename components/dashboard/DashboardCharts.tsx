"use client";

import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const salesData = [
  { month: "Jan", sales: 4000, profit: 2400 },
  { month: "Feb", sales: 3000, profit: 1398 },
  { month: "Mar", sales: 2000, profit: 9800 },
  { month: "Apr", sales: 2780, profit: 3908 },
  { month: "May", sales: 1890, profit: 4800 },
  { month: "Jun", sales: 2390, profit: 3800 },
  { month: "Jul", sales: 3490, profit: 4300 },
];

const revenueData = [
  { category: "Product A", value: 2400 },
  { category: "Product B", value: 4567 },
  { category: "Product C", value: 1398 },
  { category: "Product D", value: 9800 },
];

const clientsData = [
  { name: "Week 1", new: 400 },
  { name: "Week 2", new: 600 },
  { name: "Week 3", new: 800 },
  { name: "Week 4", new: 700 },
];

const COLORS = ["#3b82f6", "#6366f1", "#f59e0b", "#10b981"];

const DashboardCharts = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
      {/* Line Chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Sales Overview
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="profit"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Revenue Breakdown
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="category" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {revenueData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Client Growth
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={clientsData}
              dataKey="new"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {clientsData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardCharts;
