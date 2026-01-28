"use client";

import { Table, Spin, Tag, Button, Switch, Tooltip } from "antd";
import { FiEye, FiTrash, FiEdit2, FiPlus, FiLink } from "react-icons/fi";
import { useMutation, useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// import { DELETE_INVOICE } from "@/lib/graphql/mutations/invoice.mutations";
import {
    EnableInvoicePublicShareMutation,
    EnableInvoicePublicShareMutationVariables,
    InvoiceType,
} from "@/lib/graphql/generated-types";
import { GET_MY_INVOICES } from "@/lib/graphql/queries/invoice.queries";
import {
    DELETE_INVOICE,
    ENABLE_INVOICE_PUBLIC_SHARE,
} from "@/lib/graphql/mutations/invoice.mutations";
import { useEffect, useState } from "react";
import ConfirmModal from "@/utils/ConfirmModal";
import { useToast } from "@/app/providers/ToastProvider";

/* ================= TYPES ================= */

type InvoiceRow = InvoiceType & {
    publicShare?: boolean | null;
};

/* ================= COMPONENT ================= */

const InvoiceTable = () => {
    const router = useRouter();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const toast = useToast();
    const [shareState, setShareState] = useState<
        Record<string, { enabled: boolean; link?: string }>
    >({});

    /* ================= QUERY ================= */

    const { data, loading, error } = useQuery<{
        myInvoices: InvoiceType[];
    }>(GET_MY_INVOICES, {
        fetchPolicy: "cache-and-network",
        nextFetchPolicy: "cache-first",
    });

    /* ================= MUTATION ================= */

    const [deleteInvoice, { loading: deleteLoading }] = useMutation(DELETE_INVOICE, {
        refetchQueries: [{ query: GET_MY_INVOICES }],
    });
    const [enableInvoicePublicShare] = useMutation<
        EnableInvoicePublicShareMutation,
        EnableInvoicePublicShareMutationVariables
    >(ENABLE_INVOICE_PUBLIC_SHARE);

    const invoices = data?.myInvoices ?? [];

    useEffect(() => {
        if (!invoices.length) return;
        const next: Record<string, { enabled: boolean; link?: string }> = {};
        invoices.forEach((inv) => {
            const enabled = Boolean(inv.publicShare);
            if (enabled) {
                next[inv._id] = {
                    enabled: true,
                };
            }
        });
        setShareState(next);
    }, [invoices]);

    /* ================= HANDLERS ================= */

    const handleDelete = async (id: string) => {
        setSelectedId(id);
        setModalVisible(true);
    };
    const confirmDelete = async () => {
        try {
            await deleteInvoice({ variables: { id: selectedId } });
            setSelectedId(null);
            setModalVisible(false);
        } catch (err) {
            setSelectedId(null);
            setModalVisible(false);
            console.error(err)
        }
    };

    /* ================= STATES ================= */

    if (loading) {
        return (
            <div className="flex justify-center py-10">
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-500">
                Failed to load invoices.
            </div>
        );
    }

    const buildPublicLink = (value?: string, fallbackId?: string) => {
        if (!value && !fallbackId) return "";
        if (value && /^https?:\/\//i.test(value)) return value;
        if (value && value.startsWith("/")) {
            return typeof window === "undefined"
                ? value
                : `${window.location.origin}${value}`;
        }
        const id = value || fallbackId || "";
        return typeof window === "undefined"
            ? `/public-invoice/${id}`
            : `${window.location.origin}/public-invoice/${id}`;
    };

    const handleToggleShare = async (record: InvoiceRow, enabled: boolean) => {
        setShareState((prev) => ({
            ...prev,
            [record._id]: {
                enabled,
                link: enabled ? buildPublicLink(undefined, record._id) : undefined,
            },
        }));
        try {
            const { data: mutationData } = await enableInvoicePublicShare({
                variables: { id: record._id, enabled },
                optimisticResponse: {
                    enableInvoicePublicShare: enabled ? record._id : "",
                },
            });
            const shareValue = mutationData?.enableInvoicePublicShare;
            const link = enabled ? buildPublicLink(shareValue, record._id) : undefined;
            setShareState((prev) => ({
                ...prev,
                [record._id]: { enabled, link },
            }));
            toast?.success(
                enabled ? "Public share enabled" : "Public share disabled"
            );
        } catch (err) {
            setShareState((prev) => ({
                ...prev,
                [record._id]: { enabled: !enabled, link: prev[record._id]?.link },
            }));
            toast?.error("Failed to update public share");
        }
    };

    const handleCopyLink = async (record: InvoiceRow) => {
        const finalLink = buildPublicLink(undefined, record._id);
        if (!finalLink) {
            toast?.error("Public link not available");
            return;
        }
        try {
            await navigator.clipboard.writeText(finalLink);
            toast?.success("Link copied");
        } catch {
            toast?.error("Failed to copy link");
        }
    };

    /* ================= TABLE COLUMNS ================= */

    const columns = [
        {
            title: "Invoice #",
            dataIndex: "invoiceNumber",
            key: "invoiceNumber",
        },
        {
            title: "Client",
            key: "client",
            render: (_: unknown, record: InvoiceRow) =>
                record?.clientInfo?.name ?? "—",
        },
        {
            title: "Business",
            key: "business",
            render: (_: unknown, record: InvoiceRow) =>
                record.businessInfo?.companyName ?? "—",
        },
        {
            title: "Issue Date",
            dataIndex: "issueDate",
            key: "issueDate",
            render: (date: string) =>
                new Date(date).toISOString().substring(0, 10),
        },
        {
            title: "Due Date",
            dataIndex: "dueDate",
            key: "dueDate",
            render: (date: string) =>
                new Date(date).toISOString().substring(0, 10),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status: string) => {
                const color =
                    status === "DRAFT"
                        ? "blue"
                        : status === "INVOICE"
                            ? "green"
                            : status === "PROPOSAL"
                                ? "gold"
                                : status === "QUOTATION"
                                    ? "purple"
                                    : "default";

                return <Tag color={color}>{status}</Tag>;
            },
        },
        {
            title: "Public",
            key: "public",
            render: (_: unknown, record: InvoiceRow) => {
                const enabled =
                    shareState[record._id]?.enabled ??
                    Boolean(record.publicShare);
                return (
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={enabled}
                            onChange={(checked) =>
                                handleToggleShare(record, checked)
                            }
                        />
                        {enabled && (
                            <Tooltip title="Copy public link">
                                <Button
                                    size="small"
                                    icon={<FiLink />}
                                    onClick={() => handleCopyLink(record)}
                                />
                            </Tooltip>
                        )}
                    </div>
                );
            },
        },
        {
            title: "Actions",
            key: "actions",
            render: (_: unknown, record: InvoiceRow) => (
                <div className="flex gap-3 text-lg">
                    <FiEye
                        className="cursor-pointer text-blue-600 hover:text-blue-800"
                        onClick={() =>
                            router.push(`/invoices/view/${record._id}`)
                        }
                    />
                    <FiEdit2
                        className="cursor-pointer text-amber-600 hover:text-amber-800"
                        onClick={() =>
                            router.push(`/invoices/edit/${record._id}`)
                        }
                    />
                    <FiTrash
                        className="cursor-pointer text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(record._id)}
                    />
                </div>
            ),
        },
    ];

    /* ================= RENDER ================= */

    return (
        <div className="p-4 bg-white rounded-lg shadow">
            <ConfirmModal
                open={modalVisible}
                title="Delete Invoice?"
                onCancel={() => setModalVisible(false)}
                onConfirm={confirmDelete}
                loading={deleteLoading}
            />
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                    Invoices
                </h2>
                <Link href="/generate-invoice">
                    <Button
                        type="primary"
                        icon={<FiPlus />}
                        className="flex items-center gap-2"
                    >
                        Create Invoice
                    </Button>
                </Link>
            </div>

            <Table<InvoiceRow>
                columns={columns}
                dataSource={invoices.map((inv) => ({
                    ...inv,
                    key: inv._id,
                }))}
                pagination={{ pageSize: 5 }}
            />
        </div>
    );
};

export default InvoiceTable;
