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

const COLORS = ["#3b82f6", "#6366f1", "#f59e0b", "#10b981"];

type SalesPoint = {
  month: string;
  revenue: number;
  invoices: number;
};

type BreakdownPoint = {
  label: string;
  value: number;
};

type ClientSharePoint = {
  label: string;
  value: number;
};

interface DashboardChartsProps {
  salesSeries: SalesPoint[];
  revenueBreakdown: BreakdownPoint[];
  clientGrowth: ClientSharePoint[];
}

const DashboardCharts = ({
  salesSeries,
  revenueBreakdown,
  clientGrowth,
}: DashboardChartsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
      {/* Line Chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Revenue & Invoices
        </h3>
        {salesSeries.length ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={salesSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="invoices"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-slate-500">
            No invoice data yet
          </div>
        )}
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Top Clients by Revenue
        </h3>
        {revenueBreakdown.length ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="label" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {revenueBreakdown.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-slate-500">
            No client revenue yet
          </div>
        )}
      </div>

      {/* Pie Chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          New Clients (Recent Months)
        </h3>
        {clientGrowth.length ? (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={clientGrowth}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {clientGrowth.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-slate-500">
            No client data yet
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardCharts;
