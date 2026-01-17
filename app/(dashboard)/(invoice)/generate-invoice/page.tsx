"use client";

import { useState, useMemo } from "react";
import InvoiceForm from "@/components/invoice/InvoiceForm";
import AddInvoiceColumnModal from "@/components/invoice/AddInvoiceColumnModal";
import InvoicePreview from "@/components/invoice/InvoicePreview";
import { CREATE_INVOICE } from "@/lib/graphql/mutations/invoice.mutations";
import { useMutation } from "@apollo/client/react";
import { v4 as uuid } from "uuid";
import { useRouter } from "next/navigation";

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
  items: InvoiceItem[];
  notes: string;
  discount: number;
  paid: number;
  subtotal: number;
  total: number;
}

export type InvoiceColumnInput = {
  id?: string;
  fieldKey: string;
  label: string;
  type: "text" | "number";
  order: number;
  behavior: "ADD" | "SUBTRACT" | "NONE";
  locked?: boolean;
};

/* ================= PAGE ================= */

const Page = () => {
  const router = useRouter();
  const [invoiceData, setInvoiceData] =
    useState<InvoiceFormValues | null>(null);

  const [createInvoice, { loading }] = useMutation(CREATE_INVOICE);

  const [columns, setColumns] = useState<InvoiceColumnInput[]>([
    {
      id: "description",
      fieldKey: "description",
      label: "Description",
      type: "text",
      behavior: "NONE",
      order: 1,
      locked: true,
    },
    {
      id: "quantity",
      fieldKey: "quantity",
      label: "Qty",
      type: "number",
      behavior: "NONE",
      order: 2,
      locked: true,
    },
    {
      id: "price",
      fieldKey: "price",
      label: "Price",
      type: "number",
      behavior: "NONE",
      order: 3,
      locked: true,
    },
    {
      id: "total",
      fieldKey: "total",
      label: "Total",
      type: "number",
      behavior: "NONE",
      order: 4,
      locked: true,
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
      notes: invoiceData.notes,
      subtotal: invoiceData.subtotal,
      discount: invoiceData.discount,
      paid: invoiceData.paid,
      total: invoiceData.total,

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

    try {
      await createInvoice({
        variables: {
          input: {
            businessId: invoiceData.business,
            clientId: invoiceData.client,
            clientName: "Test Name",
            invoiceNumber: `INV-${Date.now()}`,
            currency: invoiceData.currency,
            issueDate: invoiceData.issueDate,
            dueDate: invoiceData.dueDate,
            notes: invoiceData.notes,
            status: invoiceData.status,

            columns: columns.map((c) => ({
              ...c,
              id: c.id ?? uuid(),
            })),

            items: itemsForApi,

            totals: {
              subTotal: invoiceData.subtotal,
              grandTotal: invoiceData.total,
              additions: { tax: 0, shipping: 0 },
              subtractions: { discount: invoiceData.discount, paid: invoiceData.paid },
            },
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
    <div className="min-h-screen flex flex-col gap-8 bg-gray-50">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <InvoiceForm
          columns={columns}
          setColumns={setColumns}
          onUpdate={setInvoiceData}
          setAddColumnModalOpen={setAddColumnModalOpen}
          handleSubmit={handleSubmit}
          loading={loading}
          editing={false}
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

export default Page;
