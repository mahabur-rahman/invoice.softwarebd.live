"use client";

import { Table, Spin, Tag } from "antd";
import { FiEye, FiTrash } from "react-icons/fi";
import { useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";

// import { DELETE_INVOICE } from "@/lib/graphql/mutations/invoice.mutations";
import { InvoiceType } from "@/lib/graphql/generated-types";
import { GET_MY_INVOICES } from "@/lib/graphql/queries/invoice.queries";

/* ================= TYPES ================= */

type InvoiceRow = InvoiceType;

/* ================= COMPONENT ================= */

const InvoiceTable = () => {
    const router = useRouter();

    /* ================= QUERY ================= */

    const { data, loading, error } = useQuery<{
        myInvoices: InvoiceType[];
    }>(GET_MY_INVOICES);

    /* ================= MUTATION ================= */

    //   const [deleteInvoice] = useMutation(DELETE_INVOICE, {
    //     refetchQueries: [{ query: GET_MY_INVOICES }],
    //   });

    /* ================= HANDLERS ================= */

    const handleDelete = async (id: string) => {
        // await deleteInvoice({ variables: { id } });
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

    const invoices = data?.myInvoices ?? [];

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
                    status === "PAID"
                        ? "green"
                        : status === "DRAFT"
                            ? "blue"
                            : "orange";

                return <Tag color={color}>{status}</Tag>;
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
            <h2 className="text-xl font-semibold mb-4">
                Invoices
            </h2>

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
