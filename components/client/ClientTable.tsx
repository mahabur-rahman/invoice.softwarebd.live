"use client";

import React, { useMemo, useState } from "react";
import { Table, Spin, Button, Modal, Tooltip } from "antd";
import { FiEdit, FiTrash, FiPlus } from "react-icons/fi";
import { useQuery } from "@apollo/client/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { GET_ALL_CLIENTS } from "@/lib/graphql/queries/invoice.queries";
import { ClientType } from "@/lib/graphql/generated-types";
import { useToast } from "@/app/providers/ToastProvider";
import { readStoredUser } from "@/utils/auth-storage";

type ClientRow = ClientType & {
  country?: string | null;
  countryCode?: string | null;
  invoicesCount?: number | null;
  hasInvoices?: boolean | null;
};

type DeleteClientResponse = {
  success?: boolean;
  message?: string;
  error?: {
    message?: string;
    messages?: string[];
  };
};

const ClientTable = () => {
  const router = useRouter();
  const toast = useToast();

  const { data, loading, error, refetch } = useQuery<{
    findAllClients: ClientRow[];
  }>(GET_ALL_CLIENTS, {
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const apiBase = useMemo(() => {
    const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ?? "";
    if (!endpoint) return "";
    try {
      const url = new URL(endpoint);
      return url.origin.replace(/\/$/, "");
    } catch {
      return endpoint.replace(/\/graphql\/?$/i, "").replace(/\/$/, "");
    }
  }, []);

  const hasInvoices = (client: ClientRow) => {
    const count = Number(client.invoicesCount ?? 0);
    return count > 0 || client.hasInvoices === true;
  };

  const onClickDelete = (client: ClientRow) => {
    if (deletingId) return;
    if (hasInvoices(client)) {
      toast?.error("You can't delete this client because invoices exist.");
      return;
    }
    setSelectedClient(client);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    if (deletingId) return;
    setConfirmOpen(false);
    setSelectedClient(null);
  };

  const getApiDeleteUrl = (clientId: string) => {
    const safeId = encodeURIComponent(clientId);
    return apiBase ? `${apiBase}/api/clients/${safeId}` : `/api/clients/${safeId}`;
  };

  const getDeleteErrorMessage = (payload: DeleteClientResponse | null) => {
    if (!payload) return "";
    if (payload.message) return payload.message;
    if (payload.error?.message) return payload.error.message;
    if (Array.isArray(payload.error?.messages) && payload.error.messages.length) {
      return payload.error.messages[0] ?? "";
    }
    return "";
  };

  const onConfirmDelete = async () => {
    if (!selectedClient) return;

    const id = selectedClient._id;
    setDeletingId(id);

    try {
      const token = readStoredUser()?.accessToken ?? "";
      const response = await fetch(getApiDeleteUrl(id), {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      let payload: DeleteClientResponse | null = null;
      try {
        payload = (await response.json()) as DeleteClientResponse;
      } catch {
        payload = null;
      }

      if (response.ok) {
        toast?.success("Client deleted successfully");
        await refetch();
        setConfirmOpen(false);
        setSelectedClient(null);
        return;
      }

      if (response.status === 409) {
        toast?.error(
          payload?.message || "Client has invoices, cannot delete.",
        );
        return;
      }

      toast?.error(
        getDeleteErrorMessage(payload) || "Failed to delete client. Try again.",
      );
    } catch {
      toast?.error("Failed to delete client. Try again.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-10">
        <Spin size="large" />
      </div>
    );

  if (error)
    return <div className="text-red-500">Failed to load clients.</div>;

  const clients = data?.findAllClients ?? [];

  const columns = [
    {
      title: "Client Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Company",
      dataIndex: "clientCompanyName",
      key: "clientCompanyName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (_: string, record: ClientRow) =>
        [record.countryCode, record.phone].filter(Boolean).join(" ") || "—",
    },
    {
      title: "Country",
      dataIndex: "country",
      key: "country",
      render: (value: string | null | undefined) => value || "—",
    },
    {
      title: "Business",
      dataIndex: "business",
      key: "business",
      render: (business: ClientRow["business"]) =>
        business?.companyName ?? "N/A",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (ts: number) => {
        const date = new Date(ts);
        return date.toISOString().replace("T", " ").substring(0, 19);
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: ClientRow) => {
        const rowDeleting = deletingId === record._id;
        const deleteBlocked = hasInvoices(record);
        const editDisabled = rowDeleting;
        const deleteDisabled = rowDeleting || deleteBlocked;
        const deleteTooltip = rowDeleting
          ? "Deleting..."
          : deleteBlocked
            ? "Cannot delete: invoices exist"
            : "Delete client";

        return (
          <div className="flex gap-3 text-lg">
            <Tooltip title={editDisabled ? "Please wait..." : "Edit client"}>
              <span>
                <button
                  type="button"
                  aria-label="Edit client"
                  disabled={editDisabled}
                  className={`inline-flex items-center ${editDisabled
                    ? "cursor-not-allowed text-blue-300"
                    : "cursor-pointer text-blue-600 hover:text-blue-800"
                    }`}
                  onClick={() => router.push(`/clients/edit/${record._id}`)}
                >
                  <FiEdit />
                </button>
              </span>
            </Tooltip>

            <Tooltip title={deleteTooltip}>
              <span>
                <button
                  type="button"
                  aria-label="Delete client"
                  disabled={deleteDisabled}
                  className={`inline-flex min-w-[18px] items-center justify-center ${deleteDisabled
                    ? "cursor-not-allowed text-red-300"
                    : "cursor-pointer text-red-500 hover:text-red-700"
                    }`}
                  onClick={() => onClickDelete(record)}
                >
                  {rowDeleting ? <Spin size="small" /> : <FiTrash />}
                </button>
              </span>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Modal
        open={confirmOpen}
        title="Delete client"
        onCancel={closeConfirm}
        onOk={onConfirmDelete}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{
          danger: true,
          loading: Boolean(selectedClient && deletingId === selectedClient._id),
          disabled: !selectedClient,
        }}
        cancelButtonProps={{ disabled: Boolean(deletingId) }}
        centered
        destroyOnClose
      >
        <p className="text-gray-600">
          Delete{" "}
          <span className="font-medium text-gray-800">
            {selectedClient?.name || "this client"}
          </span>
          ? This can&apos;t be undone.
        </p>
      </Modal>

      <div className="p-4 bg-white rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Clients</h2>
          <Link href="/clients/add-new">
            <Button
              type="primary"
              icon={<FiPlus />}
              className="flex items-center gap-2"
            >
              Add Client
            </Button>
          </Link>
        </div>

        <Table<ClientRow>
          columns={columns}
          rowKey="_id"
          dataSource={clients.map((item) => ({
            ...item,
            key: item._id,
          }))}
          pagination={{ pageSize: 5 }}
        />
      </div>
    </>
  );
};

export default ClientTable;
