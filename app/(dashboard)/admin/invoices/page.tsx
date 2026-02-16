"use client";

import { useEffect, useMemo, useState } from "react";
import { Input, Pagination, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useQuery } from "@apollo/client/react";
import { ADMIN_INVOICES_QUERY } from "@/lib/graphql/queries/admin.queries";
import type { InvoiceListType, InvoiceType } from "@/lib/graphql/generated-types";

type AdminInvoicesQueryResponse = {
  findAllInvoicesByAdminList: InvoiceListType;
};

const DEFAULT_LIMIT = 20;

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
};

const statusColor = (status?: string | null) => {
  switch (status) {
    case "INVOICE":
      return "blue";
    case "PROPOSAL":
      return "gold";
    case "QUOTATION":
      return "purple";
    case "DRAFT":
    default:
      return "default";
  }
};

const AdminInvoicesPage = () => {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(handle);
  }, [searchInput]);

  const { data, loading } = useQuery<AdminInvoicesQueryResponse>(
    ADMIN_INVOICES_QUERY,
    {
      variables: {
        limit: DEFAULT_LIMIT,
        page,
        search: search.length ? search : undefined,
      },
      fetchPolicy: "cache-and-network",
    }
  );

  const list = data?.findAllInvoicesByAdminList;
  const invoices = list?.invoices ?? [];
  const total = list?.total ?? invoices.length;

  const columns = useMemo<ColumnsType<InvoiceType>>(
    () => [
      {
        title: "Invoice",
        dataIndex: "invoiceNumber",
        key: "invoiceNumber",
        render: (value: string, record) => (
          <div>
            <div className="font-medium text-slate-900">
              {value || "Untitled"}
            </div>
            <div className="text-xs text-slate-500">{record._id}</div>
          </div>
        ),
      },
      {
        title: "Client",
        dataIndex: "clientName",
        key: "clientName",
        render: (value: string | null | undefined) => value || "—",
      },
      {
        title: "Business",
        key: "businessInfo",
        render: (_, record) => record.businessInfo?.companyName ?? "—",
      },
      {
        title: "Total",
        dataIndex: "total",
        key: "total",
        render: (value: number, record) =>
          `${record.currency ?? ""} ${value?.toFixed?.(2) ?? value ?? 0}`,
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (value: string) => (
          <Tag color={statusColor(value)}>{value}</Tag>
        ),
      },
      {
        title: "Issued",
        dataIndex: "issueDate",
        key: "issueDate",
        render: (value: string) => formatDate(value),
      },
      {
        title: "Due",
        dataIndex: "dueDate",
        key: "dueDate",
        render: (value: string) => formatDate(value),
      },
      {
        title: "Created By",
        key: "createdByInfo",
        render: (_, record) => (
          <div className="text-xs text-slate-500">
            <div className="font-medium text-slate-900">
              {record.createdByInfo?.name || "—"}
            </div>
            <div>{record.createdByInfo?.email || ""}</div>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Admin
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            All Invoices
          </h1>
        </div>
        <Input
          allowClear
          placeholder="Search by invoice number or client"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          className="w-full max-w-sm"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={invoices}
          loading={loading}
          pagination={false}
        />
      </div>

      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          Showing {(page - 1) * DEFAULT_LIMIT + 1}–{Math.min(
            page * DEFAULT_LIMIT,
            total
          )}{" "}
          of {total}
        </span>
        <Pagination
          current={page}
          total={total}
          pageSize={DEFAULT_LIMIT}
          onChange={(next) => setPage(next)}
          showSizeChanger={false}
        />
      </div>
    </div>
  );
};

export default AdminInvoicesPage;
