"use client";

import React, { useMemo } from "react";
import {
  FiDollarSign,
  FiUsers,
  FiFileText,
  FiTrendingUp,
} from "react-icons/fi";
import { useQuery } from "@apollo/client/react";
import DashboardCharts from "./DashboardCharts";
import { GET_ALL_CLIENTS, GET_MY_INVOICES } from "@/lib/graphql/queries/invoice.queries";
import type {
  FindAllClientsQuery,
  MyInvoicesQuery,
} from "@/lib/graphql/generated-types";

type InvoiceItem = MyInvoicesQuery["myInvoices"][number];

const monthLabel = (date: Date) =>
  new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);

const monthKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}`;

const buildRecentMonths = (count: number) => {
  const now = new Date();
  const months: { key: string; label: string }[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: monthKey(date), label: monthLabel(date) });
  }
  return months;
};

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const formatCurrency = (value: number, currency?: string | null) => {
  const safeValue = Number.isFinite(value) ? value : 0;
  const safeCurrency = currency || "USD";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: safeCurrency,
      maximumFractionDigits: 2,
    }).format(safeValue);
  } catch {
    return `$${safeValue.toFixed(2)}`;
  }
};

const formatCurrencyCompact = (value: number, currency?: string | null) => {
  const safeValue = Number.isFinite(value) ? value : 0;
  const safeCurrency = currency || "USD";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: safeCurrency,
      notation: "compact",
      maximumFractionDigits: safeValue >= 1000 ? 1 : 2,
    }).format(safeValue);
  } catch {
    if (safeValue >= 1_000_000_000) return `$${(safeValue / 1_000_000_000).toFixed(1)}B`;
    if (safeValue >= 1_000_000) return `$${(safeValue / 1_000_000).toFixed(1)}M`;
    if (safeValue >= 1_000) return `$${(safeValue / 1_000).toFixed(1)}K`;
    return `$${safeValue.toFixed(2)}`;
  }
};
const getInvoiceDate = (invoice: InvoiceItem) => {
  const value = invoice.issueDate || invoice.createdAt;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getInvoiceStatusLabel = (invoice: InvoiceItem) => {
  const now = new Date();
  const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : null;
  const isOverdue =
    invoice.status === "INVOICE" &&
    dueDate &&
    !Number.isNaN(dueDate.getTime()) &&
    dueDate < now;

  if (invoice.status === "DRAFT") return { label: "Draft", tone: "slate" };
  if (invoice.status === "PROPOSAL") return { label: "Proposal", tone: "amber" };
  if (invoice.status === "QUOTATION") return { label: "Quote", tone: "violet" };
  if (isOverdue) return { label: "Overdue", tone: "rose" };
  return { label: "Sent", tone: "emerald" };
};

const DashboardMain = () => {
  const { data: invoicesData } = useQuery<MyInvoicesQuery>(GET_MY_INVOICES);
  const { data: clientsData } = useQuery<FindAllClientsQuery>(GET_ALL_CLIENTS);

  const invoices = invoicesData?.myInvoices ?? [];
  const clients = clientsData?.findAllClients ?? [];

  const {
    totalRevenue,
    openInvoiceCount,
    overdueInvoiceCount,
    revenueGrowth,
    salesSeries,
    revenueBreakdown,
    clientGrowth,
    recentInvoices,
  } = useMemo(() => {
    const totalRevenueValue = invoices.reduce(
      (sum, invoice) => sum + (invoice.totals?.grandTotal ?? 0),
      0
    );

    const openCount = invoices.filter(
      (invoice) => invoice.status === "INVOICE"
    ).length;

    const now = new Date();
    const overdueCount = invoices.filter((invoice) => {
      if (invoice.status !== "INVOICE") return false;
      const due = invoice.dueDate ? new Date(invoice.dueDate) : null;
      if (!due || Number.isNaN(due.getTime())) return false;
      return due < now;
    }).length;

    const recentMonths = buildRecentMonths(6);
    const monthTotals = new Map<string, { revenue: number; invoices: number }>();
    recentMonths.forEach((month) => {
      monthTotals.set(month.key, { revenue: 0, invoices: 0 });
    });

    invoices.forEach((invoice) => {
      const date = getInvoiceDate(invoice);
      if (!date) return;
      const key = monthKey(date);
      const bucket = monthTotals.get(key);
      if (!bucket) return;
      bucket.revenue += invoice.totals?.grandTotal ?? 0;
      bucket.invoices += 1;
    });

    const salesSeriesData = recentMonths.map((month) => {
      const bucket = monthTotals.get(month.key) ?? { revenue: 0, invoices: 0 };
      return {
        month: month.label,
        revenue: Math.round(bucket.revenue),
        invoices: bucket.invoices,
      };
    });

    const currentMonth = recentMonths[recentMonths.length - 1];
    const previousMonth = recentMonths[recentMonths.length - 2];
    const currentRevenue =
      monthTotals.get(currentMonth.key)?.revenue ?? 0;
    const previousRevenue =
      monthTotals.get(previousMonth.key)?.revenue ?? 0;
    const growth =
      previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : currentRevenue > 0
        ? 100
        : 0;

    const clientTotals = new Map<string, number>();
    invoices.forEach((invoice) => {
      const name = invoice.clientInfo?.name || "Unknown";
      const total = invoice.totals?.grandTotal ?? 0;
      clientTotals.set(name, (clientTotals.get(name) ?? 0) + total);
    });

    const topClients = Array.from(clientTotals.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);

    const clientMonths = buildRecentMonths(4);
    const clientMonthTotals = new Map<string, number>();
    clientMonths.forEach((month) => clientMonthTotals.set(month.key, 0));

    clients.forEach((client) => {
      const createdAt = client.createdAt ? new Date(client.createdAt) : null;
      if (!createdAt || Number.isNaN(createdAt.getTime())) return;
      const key = monthKey(createdAt);
      if (!clientMonthTotals.has(key)) return;
      clientMonthTotals.set(key, (clientMonthTotals.get(key) ?? 0) + 1);
    });

    const clientGrowthData = clientMonths.map((month) => ({
      label: month.label,
      value: clientMonthTotals.get(month.key) ?? 0,
    }));

    const recentInvoicesData = [...invoices]
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);

    return {
      totalRevenue: totalRevenueValue,
      openInvoiceCount: openCount,
      overdueInvoiceCount: overdueCount,
      revenueGrowth: growth,
      salesSeries: salesSeriesData,
      revenueBreakdown: topClients,
      clientGrowth: clientGrowthData,
      recentInvoices: recentInvoicesData,
    };
  }, [invoices, clients]);

  const stats = [
    {
      title: "Total Invoiced",
      value: formatCurrencyCompact(totalRevenue, invoices[0]?.currency),
      icon: <FiDollarSign size={26} />,
      color: "from-blue-500 to-indigo-500",
    },
    {
      title: "Active Clients",
      value: String(clients.length),
      icon: <FiUsers size={26} />,
      color: "from-green-400 to-emerald-500",
    },
    {
      title: "Open Invoices",
      value: String(openInvoiceCount),
      icon: <FiFileText size={26} />,
      color: "from-amber-400 to-orange-500",
    },
    {
      title: "Revenue Growth",
      value: `${revenueGrowth >= 0 ? "+" : ""}${revenueGrowth.toFixed(1)}%`,
      icon: <FiTrendingUp size={26} />,
      color: "from-pink-500 to-rose-500",
    },
  ];

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto">
      {/* ===== Top Stats ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
        {stats.map((item, i) => (
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

      {overdueInvoiceCount > 0 ? (
        <div className="px-4">
          <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {overdueInvoiceCount} invoice
            {overdueInvoiceCount === 1 ? "" : "s"} overdue. Consider sending
            reminders.
          </div>
        </div>
      ) : null}

      {/* ===== Charts Section ===== */}
      <DashboardCharts
        salesSeries={salesSeries}
        revenueBreakdown={revenueBreakdown}
        clientGrowth={clientGrowth}
      />

      {/* ===== Table Section ===== */}
      <div className="flex-1 p-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 h-full overflow-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Recent Invoices
            </h3>
            <span className="text-xs text-gray-500">
              {invoices.length} total
            </span>
          </div>
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
              {recentInvoices.length === 0 ? (
                <tr>
                  <td
                    className="p-4 text-center text-gray-500"
                    colSpan={5}
                  >
                    No invoices yet. Create your first invoice to see insights.
                  </td>
                </tr>
              ) : (
                recentInvoices.map((invoice) => {
                  const status = getInvoiceStatusLabel(invoice);
                  const amount = formatCurrency(
                    invoice.totals?.grandTotal ?? 0,
                    invoice.currency
                  );
                  const clientName =
                    invoice.clientInfo?.name || "Unknown client";
                  return (
                    <tr
                      key={invoice._id}
                      className="border-b border-gray-200 hover:bg-blue-50 transition duration-200"
                    >
                      <td className="p-2">{invoice.invoiceNumber}</td>
                      <td className="p-2 font-medium">{clientName}</td>
                      <td className="p-2">{amount}</td>
                      <td className="p-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                            status.tone === "emerald"
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                              : status.tone === "amber"
                              ? "bg-amber-100 text-amber-700 border-amber-200"
                              : status.tone === "violet"
                              ? "bg-violet-100 text-violet-700 border-violet-200"
                              : status.tone === "rose"
                              ? "bg-rose-100 text-rose-700 border-rose-200"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="p-2 text-gray-500">
                        {formatDate(invoice.issueDate)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardMain;
