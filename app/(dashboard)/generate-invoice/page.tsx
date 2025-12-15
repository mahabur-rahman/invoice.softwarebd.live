"use client";

import { useState } from "react";
import InvoiceForm from "@/components/invoice/InvoiceForm";
import InvoicePreview from "@/components/invoice/InvoicePreview";
import AddInvoiceColumnModal from "@/components/invoice/AddInvoiceColumnModal";

/* ================= TYPES ================= */

export type InvoiceItem = Record<string, string | number>;

export interface InvoiceFormValues {
  client: string;
  business: string;
  currency: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  notes: string;
  discount: number;
  paid: number;
  subtotal: number;
  total: number;
  columns: InvoiceColumnInput[]
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
  const [invoiceData, setInvoiceData] =
    useState<InvoiceFormValues | null>(null);

  const [columns, setColumns] = useState<InvoiceColumnInput[]>([
    {
      fieldKey: "description",
      label: "Description",
      type: "text",
      behavior: "NONE",
      order: 1,
      locked: true,
    },
    {
      fieldKey: "qty",
      label: "Qty",
      type: "number",
      behavior: "NONE",
      order: 2,
      locked: true,
    },
    {
      fieldKey: "price",
      label: "Price",
      type: "number",
      behavior: "NONE",
      order: 3,
      locked: true,
    },
  ]);

  const [addColumnModalOpen, setAddColumnModalOpen] = useState(false);

  console.log('invoiceData', invoiceData)
  // console.log('columns', columns)

  return (
    <div className="min-h-screen flex flex-col gap-8">
      <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow-lg p-6">
        <InvoiceForm
          columns={columns}
          setColumns={setColumns}
          onUpdate={setInvoiceData}
          setAddColumnModalOpen={setAddColumnModalOpen}
        />
      </div>

      <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow-lg p-6">
        {/* <InvoicePreview data={invoiceData} /> */}
      </div>

      <AddInvoiceColumnModal
        open={addColumnModalOpen}
        onClose={() => setAddColumnModalOpen(false)}
        columns={columns}
        setColumns={setColumns}
      />
    </div>
  );
};

export default Page;
