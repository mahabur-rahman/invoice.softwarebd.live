"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client/react";
import { v4 as uuid } from "uuid";

import InvoiceForm from "@/components/invoice/InvoiceForm";
import {
  InvoiceColumnInput,
  InvoiceFormValues,
  InvoiceItem,
} from "@/app/(dashboard)/(invoice)/generate-invoice/page";
import AddInvoiceColumnModal from "@/components/invoice/AddInvoiceColumnModal";
import InvoicePreview from "@/components/invoice/InvoicePreview";
import { SINGLE_INVOICE_QUERY } from "@/lib/graphql/queries/invoice.queries";
import { UPDATE_INVOICE } from "@/lib/graphql/mutations/invoice.mutations";

interface SingleInvoiceQueryResponse {
  singleInvoice: {
    _id: string;
    businessId: string;
    clientId: string;
    clientName?: string;
    currency: string;
    issueDate: string;
    dueDate: string;
      notes?: string;
      status: string;
      invoiceNumber: string;
      columns: InvoiceColumnInput[];
    items: {
      id: string;
      order: number;
      itemTotal?: number;
      values: {
        description?: string;
        price?: number;
        quantity?: number;
        extra?: Record<string, unknown>;
      };
    }[];
    totals: {
      subTotal: number;
      grandTotal: number;
      subtractions?: { discount?: number, paid?: number };
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

const toDateInputValue = (value?: string) => {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const [datePart] = value.split("T");
  return datePart ?? "";
};

const EditInvoicePage = () => {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;

  const [columns, setColumns] = useState<InvoiceColumnInput[]>([]);
  const [invoiceData, setInvoiceData] = useState<InvoiceFormValues | null>(
    null
  );
  const [addColumnModalOpen, setAddColumnModalOpen] = useState(false);

  const { data, loading } = useQuery<SingleInvoiceQueryResponse>(
    SINGLE_INVOICE_QUERY,
    {
      variables: { id: invoiceId },
      skip: !invoiceId,
    }
  );

  const [updateInvoice, { loading: saving }] = useMutation(UPDATE_INVOICE);

  useEffect(() => {
    if (!data?.singleInvoice) return;

    const invoice = data.singleInvoice;
    setColumns(invoice.columns ?? []);

    const items: InvoiceItem[] = [...(invoice.items ?? [])]
      .sort((a, b) => a.order - b.order)
      .map((item) => {
        const { description, price, quantity, extra = {} } = item.values || {};

        const flattenedExtra = Object.entries(extra ?? {}).reduce<
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
        }, {});

        return {
          _rowId: item.id,
          _apiId: item.id,
          description: description ?? "",
          price: Number(price ?? 0),
          quantity: Number(quantity ?? 0),
          total: Number(item.itemTotal ?? 0),
          ...flattenedExtra,
        };
      });

    setInvoiceData({
      client: invoice.clientId,
      business: invoice.businessId,
      currency: invoice.currency,
      status: invoice.status ?? "DRAFT",
      issueDate: toDateInputValue(invoice.issueDate),
      dueDate: toDateInputValue(invoice.dueDate),
      items,
      notes: invoice.notes ?? "",
      subtotal: invoice.totals?.subTotal ?? 0,
      total: invoice.totals?.grandTotal ?? 0,
      totalsCustom: invoice.totals?.custom ?? [],
    });
  }, [data]);

  const handleSubmit = async () => {
    if (!invoiceData || !invoiceId) return;

    const itemsForApi = invoiceData.items.map((item, index) => {
      const { description, quantity, price, total, _rowId, _apiId, ...extra } =
        item;

      return {
        id: _apiId ?? uuid(),
        order: index + 1,
        itemTotal: Number(total),
        values: {
          description: String(description),
          quantity: Number(quantity),
          price: Number(price),
          extra,
        },
      };
    });

    await updateInvoice({
      variables: {
        input: {
          id: invoiceId,
          businessId: invoiceData.business,
          clientId: invoiceData.client,
          clientName: data?.singleInvoice.clientName ?? "",
          invoiceNumber: data?.singleInvoice.invoiceNumber ?? "",
          currency: invoiceData.currency,
          issueDate: invoiceData.issueDate,
          dueDate: invoiceData.dueDate,
          notes: invoiceData.notes,
          status: invoiceData.status,
          columns: columns.map((col) => {
            const { __typename, ...c } = col as any;

            return {
              ...c,
              id: c.id ?? uuid(),
            };
          }),
          items: itemsForApi,
          totals: {
            subTotal: invoiceData.subtotal,
            grandTotal: invoiceData.total,
            additions: { tax: 0, shipping: 0 },
            subtractions: { discount: 0, paid: 0 },
            custom: (invoiceData.totalsCustom ?? []).map((field) => ({
              key: field.key,
              label: field.label,
              behavior: field.behavior,
              valueType: field.valueType,
              value: Number(field.value || 0),
            })),
          },
        },
      },
      onCompleted: () => {
        router.push(`/invoices/view/${invoiceId}`);
      },
    });
  };

  const previewData = useMemo(() => {
    if (!invoiceData) return null;
    return {
      ...invoiceData,
      items: invoiceData.items.map((item) => ({
        ...item,
        total: Number(item.total ?? 0),
      })),
    };
  }, [invoiceData]);

  if (loading || !invoiceData) {
    return (
      <div className="flex justify-center py-20 text-gray-500">
        Loading invoice…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col gap-8 bg-gray-50">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <InvoiceForm
          columns={columns}
          setColumns={setColumns}
          onUpdate={setInvoiceData}
          setAddColumnModalOpen={setAddColumnModalOpen}
          handleSubmit={handleSubmit}
          loading={saving}
          initialValues={invoiceData}
          editing={true}
        />
      </div>

      <AddInvoiceColumnModal
        open={addColumnModalOpen}
        onClose={() => setAddColumnModalOpen(false)}
        columns={columns}
        setColumns={setColumns}
      />

      <InvoicePreview data={previewData} columns={columns} />
    </div>
  );
};

export default EditInvoicePage;
