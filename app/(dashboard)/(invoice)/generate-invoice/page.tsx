"use client";

import { useState, useMemo } from "react";
import InvoiceForm from "@/components/invoice/InvoiceForm";
import AddInvoiceColumnModal from "@/components/invoice/AddInvoiceColumnModal";
import InvoicePreview from "@/components/invoice/InvoicePreview";
import { InvoiceTemplateKey } from "@/components/invoice/templates";
import { CREATE_INVOICE } from "@/lib/graphql/mutations/invoice.mutations";
import { useMutation } from "@apollo/client/react";
import { v4 as uuid } from "uuid";
import { useRouter } from "next/navigation";
import { GET_MY_INVOICES } from "@/lib/graphql/queries/invoice.queries";
import { serializeTermsToNotes } from "@/components/invoice/termsUtils";
import type { InvoiceTerms } from "@/components/invoice/termsUtils";

/* ================= TYPES ================= */

export type InvoiceItem = Record<string, string | number> & {
  _rowId?: string;
  _apiId?: string;
};

export interface InvoiceFormValues {
  client: string;
  business: string;
  currency: string;
  status: string;
  issueDate: string;
  dueDate: string;
  invoiceNumber?: string;
  items: InvoiceItem[];
  notes: string;
  terms?: InvoiceTerms | null;
  subtotal: number;
  total: number;
  paid: number;
  balanceDue: number;
  totalsCustom: InvoiceTotalsCustomFieldInput[];
}

export type InvoiceTotalsCustomFieldInput = {
  key: string;
  label: string;
  behavior: "ADD" | "SUBTRACT" | "NONE";
  valueType: "FIXED" | "PERCENT";
  value: number;
  __typename?: string;
};

export type InvoiceColumnInput = {
  id?: string;
  fieldKey: string;
  label: string;
  type: "text" | "number";
  order: number;
  behavior: "ADD" | "SUBTRACT" | "NONE";
  locked?: boolean;
  hidden?: boolean;
  format?: "PERCENT" | "FIXED" | "TEXT";
  role?: "discount" | "tax" | "fee" | "custom" | "base";
  affectsTotal?: boolean;
};

/* ================= PAGE ================= */

const Page = () => {
  const router = useRouter();
  const [invoiceData, setInvoiceData] =
    useState<InvoiceFormValues | null>(null);
  const [template, setTemplate] = useState<InvoiceTemplateKey>("MODERN");

  const [createInvoice, { loading }] = useMutation(CREATE_INVOICE, {
    refetchQueries: [{ query: GET_MY_INVOICES }],
    awaitRefetchQueries: true,
  });

  const [columns, setColumns] = useState<InvoiceColumnInput[]>([
    {
      id: "description",
      fieldKey: "description",
      label: "Description",
      type: "text",
      behavior: "NONE",
      order: 1,
      locked: true,
      hidden: false,
    },
    {
      id: "quantity",
      fieldKey: "quantity",
      label: "Qty",
      type: "number",
      behavior: "NONE",
      order: 2,
      locked: true,
      hidden: false,
    },
    {
      id: "price",
      fieldKey: "price",
      label: "Price",
      type: "number",
      behavior: "NONE",
      order: 3,
      locked: true,
      hidden: false,
    },
    {
      id: "total",
      fieldKey: "total",
      label: "Total",
      type: "number",
      behavior: "NONE",
      order: 4,
      locked: true,
      hidden: false,
    },
  ]);

  const [addColumnModalOpen, setAddColumnModalOpen] = useState(false);

  /* ================= PREVIEW DATA (KEY FIX) ================= */

  const previewData = useMemo(() => {
    if (!invoiceData) return null;

    return {
      client: invoiceData.client,
      business: invoiceData.business,
      currency: invoiceData.currency,
      status: invoiceData.status,
      issueDate: invoiceData.issueDate,
      dueDate: invoiceData.dueDate,
      invoiceNumber: invoiceData.invoiceNumber?.trim() || "Auto-generated",
      notes: invoiceData.notes,
      terms: invoiceData.terms ?? null,
      subtotal: invoiceData.subtotal,
      total: invoiceData.total,
      paid: invoiceData.paid ?? 0,
      balanceDue: invoiceData.balanceDue ?? invoiceData.total,
      template,
      totalsCustom: invoiceData.totalsCustom ?? [],

      items: invoiceData.items.map((item) => ({
        ...item,
        description: String(item.description ?? ""),
        quantity: Number(item.quantity ?? 0),
        price: Number(item.price ?? 0),
        total: Number(item.total ?? 0),
      })),
    };
  }, [invoiceData]);

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (!invoiceData) return;

    console.log('submitting data: ', invoiceData)
    // return;

    const itemsForApi = invoiceData.items.map((item, index) => {
      const { description, quantity, price, total, _rowId, _apiId, ...extra } =
        item;

      return {
        id: uuid(),
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

    const columnsForApi = columns.map((c) => ({
      id: c.id ?? uuid(),
      fieldKey: c.fieldKey,
      label: c.label,
      type: c.type,
      order: c.order,
      behavior: c.behavior,
      locked: c.locked,
      format: c.format,
      role: c.role,
      affectsTotal: c.affectsTotal,
    }));
    const customTotalsForApi = (invoiceData.totalsCustom ?? []).map(
      ({ __typename, ...field }) => field
    );

    try {
      await createInvoice({
        variables: {
          input: {
            businessId: invoiceData.business,
            clientId: invoiceData.client,
            clientName: "Test Name",
            ...(invoiceData.invoiceNumber?.trim()
              ? { invoiceNumber: invoiceData.invoiceNumber.trim() }
              : {}),
            currency: invoiceData.currency,
            issueDate: invoiceData.issueDate,
            dueDate: invoiceData.dueDate,
            notes: serializeTermsToNotes(invoiceData.terms),
            status: invoiceData.status,

            columns: columnsForApi,

            items: itemsForApi,

            totals: {
              subTotal: invoiceData.subtotal,
              grandTotal: invoiceData.total,
              additions: { tax: 0, shipping: 0 },
              subtractions: { discount: 0, paid: Number(invoiceData.paid || 0) },
              custom: customTotalsForApi,
            },
            template,
          },
        },
      });
      setInvoiceData(null);
      router.push('/invoices')
    } catch (err) {
      console.log(err)
    }

  };

  /* ================= RENDER ================= */

  return (
    <div className="min-h-screen flex flex-col gap-8 bg-slate-50">
      <div className="rounded-2xl border border-white/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
        <InvoiceForm
          columns={columns}
          setColumns={setColumns}
          onUpdate={setInvoiceData}
          setAddColumnModalOpen={setAddColumnModalOpen}
          handleSubmit={handleSubmit}
          loading={loading}
          editing={false}
          defaultInvoiceNumber=""
        />
      </div>

      <AddInvoiceColumnModal
        open={addColumnModalOpen}
        onClose={() => setAddColumnModalOpen(false)}
        columns={columns}
        setColumns={setColumns}
      />

      <InvoicePreview
        data={previewData}
        columns={columns}
        template={template}
        onTemplateChange={setTemplate}
      />
    </div>
  );
};

export default Page;
