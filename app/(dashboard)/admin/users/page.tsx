"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Avatar, Input, Pagination, Switch, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMutation, useQuery } from "@apollo/client/react";
import { ADMIN_USERS_QUERY } from "@/lib/graphql/queries/admin.queries";
import { UPDATE_USER_STATUS_BY_ADMIN } from "@/lib/graphql/mutations/admin.mutations";
import { getUserInitials } from "@/utils/auth-storage";
import { useToast } from "@/app/providers/ToastProvider";
import type {
  AdminUserSummaryType,
  AdminUsersListType,
  UserStatus,
} from "@/lib/graphql/generated-types";

type AdminUsersQueryResponse = {
  findAllUsersByAdmin: AdminUsersListType;
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

const statusColor = (status: UserStatus) => {
  if (status === "ACTIVE") return "green";
  return "red";
};

const AdminUsersPage = () => {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(handle);
  }, [searchInput]);

  const { data, loading, refetch } = useQuery<AdminUsersQueryResponse>(
    ADMIN_USERS_QUERY,
    {
      variables: {
        limit: DEFAULT_LIMIT,
        page,
        search: search.length ? search : undefined,
      },
      fetchPolicy: "cache-and-network",
    }
  );

  const [updateUserStatus] = useMutation(UPDATE_USER_STATUS_BY_ADMIN);

  const users = data?.findAllUsersByAdmin?.users ?? [];
  const stats = data?.findAllUsersByAdmin?.stats;
  const totalUsers = stats?.userCount ?? users.length;
  const totalPages = stats?.totalPages ?? 1;

  const handleToggle = useCallback(
    async (user: AdminUserSummaryType, next: boolean) => {
      const nextStatus: UserStatus = next ? "ACTIVE" : "INACTIVE";
      setUpdatingUserId(user._id);
      try {
        await updateUserStatus({
          variables: {
            input: {
              userId: user._id,
              status: nextStatus,
            },
          },
        });
        toast?.success(
          `${user.email} ${
            nextStatus === "ACTIVE" ? "activated" : "deactivated"
          }`
        );
        refetch();
      } catch (error) {
        toast?.error("Failed to update user status.");
      } finally {
        setUpdatingUserId(null);
      }
    },
    [refetch, toast, updateUserStatus]
  );

  const columns = useMemo<ColumnsType<AdminUserSummaryType>>(
    () => [
      {
        title: "User",
        dataIndex: "email",
        key: "user",
        render: (_, record) => (
          <div className="flex items-center gap-3">
            <Avatar src={record.picture || undefined}>
              {getUserInitials({
                name: record.name ?? undefined,
                email: record.email ?? undefined,
                picture: record.picture ?? undefined,
                _id: record._id,
              })}
            </Avatar>
            <div>
              <div className="font-medium text-slate-900">
                {record.name || "Unnamed"}
              </div>
              <div className="text-xs text-slate-500">{record.email}</div>
            </div>
          </div>
        ),
      },
      {
        title: "Role",
        dataIndex: "role",
        key: "role",
        render: (value: string) => (
          <Tag color={value === "ADMIN" ? "blue" : "default"}>{value}</Tag>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (value: UserStatus) => (
          <Tag color={statusColor(value)}>{value}</Tag>
        ),
      },
      {
        title: "Activity",
        key: "activity",
        render: (_, record) => (
          <div className="text-xs text-slate-500">
            <div>{record.isOnline ? "Online" : "Offline"}</div>
            <div>Last seen {formatDate(record.lastSeenAt ?? null)}</div>
          </div>
        ),
      },
      {
        title: "Stats",
        key: "stats",
        render: (_, record) => (
          <div className="text-xs text-slate-500">
            <div>{record.stats?.clientCount ?? 0} clients</div>
            <div>{record.stats?.invoiceCount ?? 0} invoices</div>
          </div>
        ),
      },
      {
        title: "Created",
        dataIndex: "createdAt",
        key: "createdAt",
        render: (value: string) => formatDate(value),
      },
      {
        title: "Activate",
        key: "activate",
        render: (_, record) => (
          <Switch
            checked={record.status === "ACTIVE"}
            onChange={(checked) => handleToggle(record, checked)}
            loading={updatingUserId === record._id}
          />
        ),
      },
    ],
    [handleToggle, updatingUserId]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Admin
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            User Management
          </h1>
        </div>
        <Input
          allowClear
          placeholder="Search by name or email"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          className="w-full max-w-sm"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-400">Total users</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {stats?.userCount ?? "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-400">Active users</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-600">
            {stats?.activeUserCount ?? "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-400">Inactive users</p>
          <p className="mt-2 text-2xl font-semibold text-rose-500">
            {stats?.inactiveUserCount ?? "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-400">Page</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {stats?.page ?? page} / {stats?.totalPages ?? totalPages}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={users}
          loading={loading}
          pagination={false}
        />
      </div>

      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          Showing {(page - 1) * DEFAULT_LIMIT + 1}–{Math.min(
            page * DEFAULT_LIMIT,
            totalUsers
          )}{" "}
          of {totalUsers}
        </span>
        <Pagination
          current={page}
          total={totalUsers}
          pageSize={DEFAULT_LIMIT}
          onChange={(next) => setPage(next)}
          showSizeChanger={false}
        />
      </div>
    </div>
  );
};

export default AdminUsersPage;
