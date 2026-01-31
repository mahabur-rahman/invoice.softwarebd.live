"use client";

import { Table, Spin, Tag, Button, Switch, Tooltip, Input, Select, Modal, Dropdown, Drawer, Pagination } from "antd";
import { FiEye, FiTrash, FiEdit2, FiPlus, FiLink, FiMoreVertical, FiCopy, FiDownload } from "react-icons/fi";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

// import { DELETE_INVOICE } from "@/lib/graphql/mutations/invoice.mutations";
import {
    EnableInvoicePublicShareMutation,
    EnableInvoicePublicShareMutationVariables,
    BusinessType,
    ClientType,
    InvoiceType,
} from "@/lib/graphql/generated-types";
import { GET_MY_INVOICES, SINGLE_INVOICE_QUERY } from "@/lib/graphql/queries/invoice.queries";
import {
    BULK_DELETE_INVOICES,
    DELETE_INVOICE,
    DUPLICATE_INVOICE,
    ENABLE_INVOICE_PUBLIC_SHARE,
    UPDATE_INVOICE,
} from "@/lib/graphql/mutations/invoice.mutations";
import { useEffect, useMemo, useState } from "react";
import ConfirmModal from "@/utils/ConfirmModal";
import { useToast } from "@/app/providers/ToastProvider";
import InvoicePreview from "@/components/invoice/InvoicePreview";
import { InvoiceColumnInput } from "@/app/(dashboard)/(invoice)/generate-invoice/page";
import { InvoiceTemplateKey } from "@/components/invoice/templates";
import { parseTermsFromNotes } from "@/components/invoice/termsUtils";
import { InvoiceData } from "@/components/invoice/templates/types";
import { useUserStore } from "@/lib/store/userStore";

/* ================= TYPES ================= */

type InvoiceRow = InvoiceType & {
    publicShare?: boolean | null;
};

interface SingleInvoiceQueryResponse {
    singleInvoice: {
        _id: string;
        businessId: string;
        businessInfo?: BusinessType | null;
        clientId: string;
        clientInfo?: ClientType | null;
        clientName?: string;
        invoiceNumber?: string;
        currency: string;
        status: string;
        issueDate: string;
        dueDate: string;
        notes?: string;
        template?: InvoiceTemplateKey;
        columns: InvoiceColumnInput[];
        items: {
            id: string;
            order: number;
            itemTotal?: number;
            values: {
                description?: string;
                price?: number;
                quantity?: number;
                extra?: Record<string, string | number>;
            };
        }[];
        totals: {
            subTotal: number;
            grandTotal: number;
            balanceDue?: number;
            subtractions?: Record<string, number>;
            custom?: {
                key: string;
                label: string;
                behavior: "ADD" | "SUBTRACT" | "NONE";
                valueType: "FIXED" | "PERCENT";
                value: number;
            }[];
        };
    };
}

type PreviewCacheEntry = {
    invoice: SingleInvoiceQueryResponse["singleInvoice"];
    previewData: InvoiceData;
    columns: InvoiceColumnInput[];
    template: InvoiceTemplateKey;
    businessInfo?: BusinessType | null;
    clientInfo?: ClientType | null;
};

const PER_PAGE_OPTIONS = [10, 25, 50];
const DEFAULT_PER_PAGE = 10;

const toNumber = (value?: number | null) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
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

const parseDate = (value?: string | null) => {
    if (!value) return null;
    const direct = new Date(value);
    if (!Number.isNaN(direct.getTime())) return direct;
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return null;
    const [, year, month, day] = match;
    const fallback = new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
    );
    return Number.isNaN(fallback.getTime()) ? null : fallback;
};

const getPaymentStatus = (record: InvoiceRow) => {
    const total = toNumber(record.totals?.grandTotal);
    const paid = toNumber(record.totals?.subtractions?.paid);
    const balanceDue = total - paid;

    if (balanceDue <= 0) {
        return { label: "Paid", color: "green", paid, balanceDue, total };
    }
    if (paid > 0 && balanceDue > 0) {
        return { label: "Partial", color: "gold", paid, balanceDue, total };
    }
    return { label: "Due", color: "blue", paid, balanceDue, total };
};

/* ================= COMPONENT ================= */

const InvoiceTable = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const accessToken = useUserStore((state) => state.accessToken);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [paymentInvoice, setPaymentInvoice] = useState<InvoiceRow | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<string>("");
    const [paymentDate, setPaymentDate] = useState<string>(
        new Date().toISOString().substring(0, 10)
    );
    const [paymentNote, setPaymentNote] = useState<string>("");
    const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
    const [bulkActionLoading, setBulkActionLoading] = useState(false);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewInvoiceId, setPreviewInvoiceId] = useState<string | null>(null);
    const [previewRow, setPreviewRow] = useState<InvoiceRow | null>(null);
    const [previewCache, setPreviewCache] = useState<
        Record<string, PreviewCacheEntry>
    >({});
    const apiBase = useMemo(() => {
        const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ?? "";
        if (!endpoint) return "";
        try {
            const url = new URL(endpoint);
            return url.origin;
        } catch {
            return endpoint.replace(/\/graphql\/?$/i, "");
        }
    }, []);
    const toast = useToast();
    const [shareState, setShareState] = useState<
        Record<string, { enabled: boolean; link?: string }>
    >({});
    const [searchInput, setSearchInput] = useState(
        searchParams.get("search") ?? ""
    );
    const [debouncedSearch, setDebouncedSearch] = useState(
        (searchParams.get("search") ?? "").trim()
    );

    /* ================= QUERY ================= */

    const { data, loading, error, refetch } = useQuery<{
        myInvoices: InvoiceType[];
    }>(GET_MY_INVOICES, {
        fetchPolicy: "cache-and-network",
        nextFetchPolicy: "cache-first",
    });
    const [loadInvoicePreview, { data: previewQueryData, loading: previewLoading }] =
        useLazyQuery<SingleInvoiceQueryResponse>(SINGLE_INVOICE_QUERY, {
            fetchPolicy: "network-only",
            nextFetchPolicy: "cache-first",
        });

    /* ================= MUTATION ================= */

    const [deleteInvoice, { loading: deleteLoading }] = useMutation(DELETE_INVOICE);
    const [bulkDeleteInvoices] = useMutation<
        {
            bulkDeleteInvoices: {
                success: boolean;
                requested: number;
                deleted: number;
                deletedIds: string[];
                failedIds: string[];
            };
        },
        { invoiceIds: string[] }
    >(BULK_DELETE_INVOICES);
    const [duplicateInvoice] = useMutation<
        { duplicateInvoice: { newInvoiceId: string; redirectUrl: string } },
        { id: string }
    >(DUPLICATE_INVOICE);
    const [updateInvoice] = useMutation(UPDATE_INVOICE, {
        refetchQueries: [{ query: GET_MY_INVOICES }],
    });
    const [enableInvoicePublicShare] = useMutation<
        EnableInvoicePublicShareMutation,
        EnableInvoicePublicShareMutationVariables
    >(ENABLE_INVOICE_PUBLIC_SHARE);

    const invoices = data?.myInvoices ?? [];

    const statusParam = (searchParams.get("status") ?? "all").toLowerCase();
    const paymentRaw = (searchParams.get("payment") ?? "all").toLowerCase();
    const paymentParam = ["all", "paid", "due", "partial"].includes(paymentRaw)
        ? paymentRaw
        : "all";
    const publicParam = (searchParams.get("public") ?? "all").toLowerCase();
    const datePreset = (searchParams.get("datePreset") ?? "all").toLowerCase();
    const fromParam = searchParams.get("from") ?? "";
    const toParam = searchParams.get("to") ?? "";
    const pageParamRaw = Number(searchParams.get("page") ?? "1");
    const pageParam = Number.isFinite(pageParamRaw) && pageParamRaw > 0 ? pageParamRaw : 1;
    const perPageRaw = Number(searchParams.get("per_page") ?? "");
    const perPageParam = PER_PAGE_OPTIONS.includes(perPageRaw)
        ? perPageRaw
        : DEFAULT_PER_PAGE;
    const clearSelection = () => setSelectedRowKeys([]);

    const setQueryParams = (
        next: Record<string, string | undefined>,
        resetPage?: boolean
    ) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(next).forEach(([key, value]) => {
            if (!value || value === "all") {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });
        if (resetPage) {
            params.set("page", "1");
        }
        const query = params.toString();
        router.replace(query ? `${pathname}?${query}` : pathname);
    };

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

    useEffect(() => {
        const nextSearch = searchParams.get("search") ?? "";
        setSearchInput(nextSearch);
        setDebouncedSearch(nextSearch.trim());
    }, [searchParams]);

    useEffect(() => {
        const raw = searchParams.get("per_page");
        if (!raw) return;
        const parsed = Number(raw);
        if (!PER_PAGE_OPTIONS.includes(parsed)) {
            setQueryParams({ per_page: String(DEFAULT_PER_PAGE) }, true);
        }
    }, [searchParams]);

    useEffect(() => {
        if (!previewQueryData?.singleInvoice) return;
        const invoice = previewQueryData.singleInvoice;
        const paid = Number(invoice.totals?.subtractions?.paid ?? 0);
        const balanceDue = Number(
            invoice.totals?.balanceDue ??
                (invoice.totals?.grandTotal ?? 0) - paid
        );
        const terms = parseTermsFromNotes(invoice.notes ?? "");
        const previewData: InvoiceData = {
            client: invoice.clientId,
            business: invoice.businessId,
            currency: invoice.currency,
            status: invoice.status,
            issueDate: invoice.issueDate,
            dueDate: invoice.dueDate,
            notes: "",
            terms,
            subtotal: invoice.totals?.subTotal ?? 0,
            total: invoice.totals?.grandTotal ?? 0,
            paid,
            balanceDue,
            totalsCustom: invoice.totals?.custom ?? [],
            template: invoice.template ?? "CLASSIC",
            invoiceNumber: invoice.invoiceNumber ?? "",
            items: invoice.items.map((item) => {
                const { description, price, quantity, extra = {} } =
                    item.values || {};
                return {
                    description: description ?? "",
                    price: Number(price ?? 0),
                    quantity: Number(quantity ?? 0),
                    total: Number(item.itemTotal ?? 0),
                    ...Object.entries(extra ?? {}).reduce<
                        Record<string, string | number>
                    >((acc, [key, val]) => {
                        if (typeof val === "number" || typeof val === "string") {
                            acc[key] = val;
                        } else if (val == null) {
                            acc[key] = "";
                        } else {
                            acc[key] = String(val);
                        }
                        return acc;
                    }, {}),
                };
            }),
        };

        setPreviewCache((prev) => ({
            ...prev,
            [invoice._id]: {
                invoice,
                previewData,
                columns: invoice.columns ?? [],
                template: invoice.template ?? "CLASSIC",
                businessInfo: invoice.businessInfo ?? null,
                clientInfo: invoice.clientInfo ?? null,
            },
        }));
    }, [previewQueryData]);

    useEffect(() => {
        const handle = setTimeout(() => {
            const trimmed = searchInput.trim();
            setDebouncedSearch(trimmed);
            const current = searchParams.get("search") ?? "";
            if (trimmed === current) return;
            setQueryParams({ search: trimmed }, true);
        }, 400);

        return () => clearTimeout(handle);
    }, [searchInput, searchParams, pathname, router]);

    /* ================= HANDLERS ================= */

    const handleDelete = async (id: string) => {
        setSelectedId(id);
        setModalVisible(true);
    };
    const confirmDelete = async () => {
        try {
            await deleteInvoice({ variables: { id: selectedId } });
            await refetch();
            setSelectedId(null);
            setModalVisible(false);
        } catch (err) {
            setSelectedId(null);
            setModalVisible(false);
            console.error(err)
        }
    };

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

    const handleDuplicate = async (id: string) => {
        if (duplicatingId) return;
        setDuplicatingId(id);
        try {
            const { data } = await duplicateInvoice({
                variables: { id },
            });
            const payload = data?.duplicateInvoice;
            if (!payload?.newInvoiceId) {
                throw new Error("Duplicate failed");
            }
            toast?.success("Invoice duplicated");
            router.push(payload.redirectUrl || `/invoices/edit/${payload.newInvoiceId}`);
        } catch (err) {
            toast?.error("Failed to duplicate invoice");
        } finally {
            setDuplicatingId(null);
        }
    };

    const handleDownloadPdf = (id: string, invoiceNumber?: string | null) => {
        if (downloadingId) return;
        setDownloadingId(id);
        toast?.info("Preparing PDF...");
        try {
            const safeId = encodeURIComponent(id);
            const base = apiBase ? apiBase.replace(/\/$/, "") : "";
            if (!accessToken) {
                toast?.error("Login required to download PDF.");
                setDownloadingId(null);
                return;
            }
            const tokenParam = `token=${encodeURIComponent(accessToken)}`;
            const url = base
                ? `${base}/api/invoices/${safeId}/pdf?${tokenParam}`
                : `/api/invoices/${safeId}/pdf?${tokenParam}`;
            window.open(url, "_blank", "noopener,noreferrer");
        } catch (err) {
            toast?.error("Failed to download PDF. Please try again.");
        } finally {
            setTimeout(() => {
                setDownloadingId((current) => (current === id ? null : current));
            }, 800);
        }
    };

    const openPreview = (record: InvoiceRow) => {
        const id = record._id;
        setPreviewInvoiceId(id);
        setPreviewRow(record);
        setPreviewOpen(true);
        if (!previewCache[id]) {
            loadInvoicePreview({ variables: { id } });
        }
    };

    const closePreview = () => {
        setPreviewOpen(false);
    };

    const openPaymentModal = (record: InvoiceRow) => {
        const total = toNumber(record.totals?.grandTotal);
        const paid = toNumber(record.totals?.subtractions?.paid);
        const balance = total - paid;
        setPaymentInvoice(record);
        setPaymentAmount(balance > 0 ? balance.toFixed(2) : "");
        setPaymentDate(new Date().toISOString().substring(0, 10));
        setPaymentNote("");
        setPaymentModalOpen(true);
    };

    const closePaymentModal = () => {
        setPaymentModalOpen(false);
        setPaymentInvoice(null);
    };

    const handleBulkDelete = () => {
        if (!selectedRowKeys.length) return;
        setBulkDeleteOpen(true);
    };

    const confirmBulkDelete = async () => {
        const ids = [...selectedRowKeys];
        if (!ids.length) {
            setBulkDeleteOpen(false);
            return;
        }
        setBulkActionLoading(true);
        try {
            const { data } = await bulkDeleteInvoices({
                variables: { invoiceIds: ids },
            });
            const payload = data?.bulkDeleteInvoices;
            const deletedCount = payload?.deleted ?? 0;
            const failedIds = payload?.failedIds ?? [];

            if (deletedCount > 0) {
                toast?.success(
                    `${deletedCount} invoice${deletedCount > 1 ? "s" : ""} deleted`
                );
            }
            if (failedIds.length > 0) {
                toast?.error(
                    `Failed to delete ${failedIds.length} invoice${failedIds.length > 1 ? "s" : ""}`
                );
                setSelectedRowKeys(failedIds);
            } else {
                clearSelection();
            }
            await refetch();
            setBulkDeleteOpen(false);
        } catch (err) {
            toast?.error("Failed to delete invoices");
        } finally {
            setBulkActionLoading(false);
        }
    };

    const today = new Date();
    const isDateInvalid =
        datePreset === "custom" &&
        fromParam &&
        toParam &&
        (() => {
            const fromDate = parseDate(fromParam);
            const toDate = parseDate(toParam);
            if (!fromDate || !toDate) return false;
            return toDate < fromDate;
        })();

    const getDateRange = () => {
        if (datePreset === "this_month") {
            const start = new Date(today.getFullYear(), today.getMonth(), 1);
            const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            return { from: start, to: end };
        }
        if (datePreset === "last_30_days") {
            const end = new Date(today);
            const start = new Date(today);
            start.setDate(start.getDate() - 29);
            return { from: start, to: end };
        }
        if (datePreset === "custom") {
            const from = parseDate(fromParam);
            const to = parseDate(toParam);
            return { from, to };
        }
        return { from: null, to: null };
    };

    const { from: filterFrom, to: filterTo } = getDateRange();

    const normalizedSearch = debouncedSearch.trim().toLowerCase();

    const filteredInvoices = invoices.filter((invoice) => {
        if (normalizedSearch) {
            const total = toNumber(invoice.totals?.grandTotal);
            const totalString = total.toFixed(2);
            const matchSearch =
                invoice.invoiceNumber?.toLowerCase().includes(normalizedSearch) ||
                invoice.clientInfo?.name?.toLowerCase().includes(normalizedSearch) ||
                totalString.includes(normalizedSearch);
            if (!matchSearch) return false;
        }

        if (statusParam !== "all") {
            if (invoice.status?.toLowerCase() !== statusParam) return false;
        }

        if (publicParam !== "all") {
            const isPublic = Boolean(invoice.publicShare);
            if (publicParam === "1" && !isPublic) return false;
            if (publicParam === "0" && isPublic) return false;
        }

        if (paymentParam !== "all") {
            const total = toNumber(invoice.totals?.grandTotal);
            const paid = toNumber(invoice.totals?.subtractions?.paid);
            const balance = total - paid;
            const isPaid = balance <= 0;
            const isPartial = paid > 0 && balance > 0;
            const isDue = paid === 0 && balance > 0;

            if (paymentParam === "paid" && !isPaid) return false;
            if (paymentParam === "partial" && !isPartial) return false;
            if (paymentParam === "due" && !isDue) return false;
        }

        if (datePreset !== "all" && !isDateInvalid) {
            const issueDate = parseDate(invoice.issueDate);
            if (filterFrom && issueDate && issueDate < filterFrom) return false;
            if (filterTo && issueDate && issueDate > filterTo) return false;
        }

        return true;
    });

    const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / perPageParam));
    const currentPage = Math.min(pageParam, totalPages);
    const startIndex = (currentPage - 1) * perPageParam;
    const endIndex = startIndex + perPageParam;
    const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex);
    const rangeFrom = filteredInvoices.length ? startIndex + 1 : 0;
    const rangeTo = filteredInvoices.length
        ? Math.min(endIndex, filteredInvoices.length)
        : 0;
    const previewEntry = previewInvoiceId ? previewCache[previewInvoiceId] : null;
    const selectedInvoices = filteredInvoices.filter((invoice) =>
        selectedRowKeys.includes(invoice._id)
    );
    const eligibleForPaid = selectedInvoices.filter((invoice) => {
        const total = toNumber(invoice.totals?.grandTotal);
        const paid = toNumber(invoice.totals?.subtractions?.paid);
        const balance = total - paid;
        return balance > 0;
    });

    const handleBulkMarkPaid = async () => {
        if (!eligibleForPaid.length) return;
        setBulkActionLoading(true);
        try {
            await Promise.all(
                eligibleForPaid.map((invoice) =>
                    updateInvoice({
                        variables: {
                            input: {
                                id: invoice._id,
                                totals: {
                                    subtractions: {
                                        paid: toNumber(invoice.totals?.grandTotal),
                                    },
                                },
                            },
                        },
                    })
                )
            );
            toast?.success(
                `${eligibleForPaid.length} invoice${eligibleForPaid.length > 1 ? "s" : ""} marked as paid`
            );
            if (eligibleForPaid.length < selectedInvoices.length) {
                const skipped = selectedInvoices.length - eligibleForPaid.length;
                toast?.info(
                    `${skipped} already paid invoice${skipped > 1 ? "s" : ""} skipped`
                );
            }
            clearSelection();
        } catch (err) {
            toast?.error("Failed to mark invoices as paid");
        } finally {
            setBulkActionLoading(false);
        }
    };

    useEffect(() => {
        if (pageParam !== currentPage) {
            setQueryParams({ page: String(currentPage) });
        }
    }, [currentPage, pageParam]);

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

    const isFiltered =
        searchInput.trim().length > 0 ||
        statusParam !== "all" ||
        paymentParam !== "all" ||
        publicParam !== "all" ||
        datePreset !== "all" ||
        fromParam ||
        toParam ||
        pageParam !== 1;

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
            title: "Issue Date",
            dataIndex: "issueDate",
            key: "issueDate",
            render: (date: string) =>
                new Date(date).toISOString().substring(0, 10),
        },
        {
            title: "Total",
            key: "total",
            align: "right" as const,
            render: (_: unknown, record: InvoiceRow) => {
                const total = toNumber(record.totals?.grandTotal);
                return formatCurrency(total, record.currency);
            },
        },
        {
            title: "Payment Status",
            key: "paymentStatus",
            render: (_: unknown, record: InvoiceRow) => {
                const status = getPaymentStatus(record);
                const balance = Math.max(0, status.balanceDue);
                const paid = Math.max(0, status.paid);
                const subtext =
                    status.label === "Paid"
                        ? `Paid: ${formatCurrency(paid, record.currency)}`
                        : status.label === "Partial"
                            ? `Paid: ${formatCurrency(paid, record.currency)} • Balance: ${formatCurrency(
                                  balance,
                                  record.currency
                              )}`
                            : `Balance: ${formatCurrency(balance, record.currency)}`;

                return (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <Tag color={status.color}>{status.label}</Tag>
                            {(status.label === "Due" || status.label === "Partial") && (
                                <Tooltip title="Record payment">
                                    <Button
                                        data-row-ignore="true"
                                        size="small"
                                        type="text"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            openPaymentModal(record);
                                        }}
                                        className="text-slate-500"
                                    >
                                        Record
                                    </Button>
                                </Tooltip>
                            )}
                        </div>
                        <span className="text-xs text-slate-500 truncate">
                            {subtext}
                        </span>
                    </div>
                );
            },
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
                            data-row-ignore="true"
                            checked={enabled}
                            onChange={(checked) =>
                                handleToggleShare(record, checked)
                            }
                            onClick={(_, event) => event.stopPropagation()}
                        />
                        {enabled && (
                            <Tooltip title="Copy public link">
                                <Button
                                    data-row-ignore="true"
                                    size="small"
                                    icon={<FiLink />}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        handleCopyLink(record);
                                    }}
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
            render: (_: unknown, record: InvoiceRow) => {
                const isDuplicating = duplicatingId === record._id;
                const isDownloading = downloadingId === record._id;
                const items = [
                    {
                        key: "view",
                        label: "View",
                        icon: <FiEye />,
                    },
                    {
                        key: "edit",
                        label: "Edit",
                        icon: <FiEdit2 />,
                    },
                    {
                        key: "duplicate",
                        label: isDuplicating ? "Duplicating..." : "Duplicate",
                        icon: <FiCopy />,
                        disabled: isDuplicating,
                    },
                    {
                        key: "download",
                        label: isDownloading ? "Preparing PDF..." : "Download PDF",
                        icon: <FiDownload />,
                        disabled: isDownloading,
                    },
                    { type: "divider" as const },
                    {
                        key: "delete",
                        label: "Delete",
                        icon: <FiTrash />,
                        danger: true,
                    },
                ];

                return (
                    <Dropdown
                        menu={{
                            items,
                            onClick: ({ key }) => {
                                if (key === "view") {
                                    router.push(`/invoices/view/${record._id}`);
                                }
                                if (key === "edit") {
                                    router.push(`/invoices/edit/${record._id}`);
                                }
                                if (key === "duplicate") {
                                    handleDuplicate(record._id);
                                }
                                if (key === "download") {
                                    handleDownloadPdf(record._id, record.invoiceNumber);
                                }
                                if (key === "delete") {
                                    handleDelete(record._id);
                                }
                            },
                        }}
                        trigger={["click"]}
                    >
                        <Button
                            size="small"
                            icon={<FiMoreVertical />}
                            aria-label="Row actions"
                            data-row-ignore="true"
                            onClick={(event) => event.stopPropagation()}
                        />
                    </Dropdown>
                );
            },
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
            <ConfirmModal
                open={bulkDeleteOpen}
                title={`Delete ${selectedRowKeys.length} invoice${selectedRowKeys.length > 1 ? "s" : ""}?`}
                onCancel={() => setBulkDeleteOpen(false)}
                onConfirm={confirmBulkDelete}
                loading={bulkActionLoading}
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

            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <Input
                    placeholder="Search invoice #, client, amount..."
                    value={searchInput}
                    onChange={(event) => {
                        clearSelection();
                        setSearchInput(event.target.value);
                    }}
                    className="w-full lg:max-w-sm"
                    allowClear
                />

                <div className="flex flex-wrap items-center gap-2">
                    <Select
                        value={statusParam}
                        onChange={(value) =>
                            (clearSelection(), setQueryParams({ status: value }, true))
                        }
                        className="w-36"
                        options={[
                            { label: "All", value: "all" },
                            { label: "Invoice", value: "invoice" },
                            { label: "Proposal", value: "proposal" },
                        ]}
                    />
                    <Select
                        value={paymentParam}
                        onChange={(value) =>
                            (clearSelection(), setQueryParams({ payment: value }, true))
                        }
                        className="w-36"
                        options={[
                            { label: "All", value: "all" },
                            { label: "Paid", value: "paid" },
                            { label: "Due", value: "due" },
                            { label: "Partial", value: "partial" },
                        ]}
                    />
                    <Select
                        value={publicParam}
                        onChange={(value) =>
                            (clearSelection(), setQueryParams({ public: value }, true))
                        }
                        className="w-36"
                        options={[
                            { label: "All", value: "all" },
                            { label: "Public", value: "1" },
                            { label: "Private", value: "0" },
                        ]}
                    />
                    <Select
                        value={datePreset}
                        onChange={(value) => {
                            clearSelection();
                            if (value === "custom") {
                                setQueryParams(
                                    {
                                        datePreset: "custom",
                                        from: fromParam || "",
                                        to: toParam || "",
                                    },
                                    true
                                );
                                return;
                            }
                            setQueryParams(
                                {
                                    datePreset: value,
                                    from: "",
                                    to: "",
                                },
                                true
                            );
                        }}
                        className="w-40"
                        options={[
                            { label: "All time", value: "all" },
                            { label: "This month", value: "this_month" },
                            { label: "Last 30 days", value: "last_30_days" },
                            { label: "Custom", value: "custom" },
                        ]}
                    />

                    {datePreset === "custom" && (
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={fromParam}
                                onChange={(event) =>
                                    (clearSelection(),
                                    setQueryParams(
                                        {
                                            datePreset: "custom",
                                            from: event.target.value,
                                        },
                                        true
                                    ))
                                }
                                className="h-9 rounded-md border border-slate-200 px-2 text-sm"
                            />
                            <input
                                type="date"
                                value={toParam}
                                onChange={(event) =>
                                    (clearSelection(),
                                    setQueryParams(
                                        {
                                            datePreset: "custom",
                                            to: event.target.value,
                                        },
                                        true
                                    ))
                                }
                                className="h-9 rounded-md border border-slate-200 px-2 text-sm"
                            />
                        </div>
                    )}

                    {isFiltered && (
                        <Button
                            onClick={() =>
                                (clearSelection(),
                                setQueryParams(
                                    {
                                        search: "",
                                        status: "all",
                                        payment: "all",
                                        public: "all",
                                        datePreset: "all",
                                        from: "",
                                        to: "",
                                        page: "1",
                                    },
                                    true
                                ))
                            }
                        >
                            Clear
                        </Button>
                    )}
                </div>
            </div>

            {isDateInvalid && (
                <div className="mb-3 text-sm text-red-500">
                    To date must be after From date.
                </div>
            )}

            {selectedRowKeys.length > 0 && (
                <div className="sticky top-2 z-10 mb-3 flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                    <span className="font-medium text-slate-700">
                        {selectedRowKeys.length} invoice
                        {selectedRowKeys.length > 1 ? "s" : ""} selected
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            size="small"
                            onClick={handleBulkMarkPaid}
                            disabled={!eligibleForPaid.length || bulkActionLoading}
                        >
                            Mark as Paid
                        </Button>
                        <Button
                            size="small"
                            danger
                            onClick={handleBulkDelete}
                            disabled={bulkActionLoading}
                        >
                            Delete
                        </Button>
                        <Button
                            size="small"
                            onClick={clearSelection}
                            disabled={bulkActionLoading}
                        >
                            Clear
                        </Button>
                    </div>
                </div>
            )}

            <Table<InvoiceRow>
                columns={columns}
                rowKey="_id"
                rowSelection={{
                    selectedRowKeys,
                    onChange: (keys) => setSelectedRowKeys(keys as string[]),
                    renderCell: (_checked, _record, _index, originNode) => (
                        <span
                            data-row-ignore="true"
                            onClick={(event) => event.stopPropagation()}
                        >
                            {originNode}
                        </span>
                    ),
                }}
                dataSource={paginatedInvoices.map((inv) => ({
                    ...inv,
                    key: inv._id,
                }))}
                loading={loading}
                rowClassName={() => "cursor-pointer hover:bg-slate-50"}
                onRow={(record) => ({
                    onClick: (event) => {
                        const target = event.target as HTMLElement | null;
                        if (target?.closest('[data-row-ignore="true"]')) return;
                        openPreview(record);
                    },
                    onKeyDown: (event) => {
                        if (event.key !== "Enter") return;
                        const target = event.target as HTMLElement | null;
                        if (target?.closest('[data-row-ignore="true"]')) return;
                        openPreview(record);
                    },
                    tabIndex: 0,
                    role: "button",
                })}
                pagination={false}
            />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
                <span>
                    {filteredInvoices.length
                        ? `Showing ${rangeFrom}\u2013${rangeTo} of ${filteredInvoices.length}`
                        : "Showing 0 of 0"}
                </span>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-slate-500">Rows per page</span>
                        <Select
                            value={perPageParam}
                            onChange={(value) =>
                                (clearSelection(),
                                setQueryParams(
                                    { per_page: String(value), page: "1" },
                                    true
                                ))
                            }
                            className="w-24"
                            options={PER_PAGE_OPTIONS.map((option) => ({
                                label: option,
                                value: option,
                            }))}
                        />
                    </div>
                    <Pagination
                        current={currentPage}
                        total={filteredInvoices.length}
                        pageSize={perPageParam}
                        onChange={(page) =>
                            (clearSelection(), setQueryParams({ page: String(page) }))
                        }
                        showSizeChanger={false}
                    />
                </div>
            </div>

            <Drawer
                title={
                    <div className="flex flex-col gap-1">
                        <span className="text-base font-semibold text-slate-900">
                            {previewEntry?.invoice.invoiceNumber ??
                                previewRow?.invoiceNumber ??
                                "Invoice preview"}
                        </span>
                        <span className="text-sm text-slate-500">
                            {previewEntry?.invoice.clientName ??
                                previewRow?.clientInfo?.name ??
                                ""}
                        </span>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                            {(() => {
                                const totals =
                                    previewEntry?.invoice.totals ??
                                    previewRow?.totals ??
                                    undefined;
                                const status = getPaymentStatus({
                                    totals,
                                } as InvoiceRow);
                                return (
                                    <Tag color={status.color}>
                                        {status.label}
                                    </Tag>
                                );
                            })()}
                            <Tag>
                                {previewEntry?.invoice.status ??
                                    previewRow?.status ??
                                    ""}
                            </Tag>
                        </div>
                    </div>
                }
                open={previewOpen}
                onClose={closePreview}
                width={720}
                destroyOnClose
                extra={
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            size="small"
                            onClick={() =>
                                previewInvoiceId &&
                                router.push(`/invoices/view/${previewInvoiceId}`)
                            }
                        >
                            View
                        </Button>
                        <Button
                            size="small"
                            onClick={() =>
                                previewInvoiceId &&
                                router.push(`/invoices/edit/${previewInvoiceId}`)
                            }
                        >
                            Edit
                        </Button>
                        <Button
                            size="small"
                            icon={<FiDownload />}
                            disabled={!previewInvoiceId || Boolean(downloadingId)}
                            onClick={() =>
                                previewInvoiceId &&
                                handleDownloadPdf(
                                    previewInvoiceId,
                                    previewEntry?.invoice.invoiceNumber
                                )
                            }
                        >
                            Download PDF
                        </Button>
                        <Button
                            size="small"
                            disabled={!previewInvoiceId || Boolean(duplicatingId)}
                            onClick={() =>
                                previewInvoiceId && handleDuplicate(previewInvoiceId)
                            }
                        >
                            Duplicate
                        </Button>
                        <Button
                            size="small"
                            danger
                            disabled={!previewInvoiceId}
                            onClick={() =>
                                previewInvoiceId && handleDelete(previewInvoiceId)
                            }
                        >
                            Delete
                        </Button>
                    </div>
                }
                aria-label="Invoice preview"
            >
                {previewLoading && !previewEntry ? (
                    <div className="flex justify-center py-10">
                        <Spin size="large" />
                    </div>
                ) : previewEntry ? (
                    <div className="pb-6">
                        <InvoicePreview
                            data={previewEntry.previewData}
                            columns={previewEntry.columns}
                            template={previewEntry.template}
                            businessOverride={previewEntry.businessInfo ?? null}
                            clientOverride={previewEntry.clientInfo ?? null}
                        />
                    </div>
                ) : (
                    <div className="text-sm text-slate-500">
                        Select an invoice to preview.
                    </div>
                )}
            </Drawer>

            <Modal
                title="Record Payment"
                open={paymentModalOpen}
                onCancel={closePaymentModal}
                onOk={async () => {
                    if (!paymentInvoice) return;
                    const amountRaw = Number(paymentAmount);
                    if (!Number.isFinite(amountRaw) || amountRaw <= 0) return;
                    const currentPaid = toNumber(
                        paymentInvoice.totals?.subtractions?.paid
                    );
                    const nextPaid = Number((currentPaid + amountRaw).toFixed(2));
                    try {
                        await updateInvoice({
                            variables: {
                                input: {
                                    id: paymentInvoice._id,
                                    totals: {
                                        subtractions: {
                                            paid: nextPaid,
                                        },
                                    },
                                },
                            },
                            refetchQueries: [{ query: GET_MY_INVOICES }],
                        });
                        toast?.success("Payment recorded");
                        closePaymentModal();
                    } catch (err) {
                        toast?.error("Failed to record payment");
                    }
                }}
                okText="Save"
            >
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700">
                            Amount
                        </label>
                        <Input
                            type="number"
                            value={paymentAmount}
                            min={0}
                            onChange={(event) => setPaymentAmount(event.target.value)}
                            className="mt-2"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700">
                            Date
                        </label>
                        <input
                            type="date"
                            value={paymentDate}
                            onChange={(event) => setPaymentDate(event.target.value)}
                            className="mt-2 h-10 w-full rounded-md border border-slate-200 px-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700">
                            Note (optional)
                        </label>
                        <Input.TextArea
                            value={paymentNote}
                            onChange={(event) => setPaymentNote(event.target.value)}
                            rows={3}
                            className="mt-2"
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default InvoiceTable;
