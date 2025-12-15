"use client";

import { useState } from "react";
import InvoiceForm from "@/components/invoice/InvoiceForm";
import InvoicePreview from "@/components/invoice/InvoicePreview";
import AddInvoiceColumnModal from "@/components/invoice/AddInvoiceColumnModal";

interface InvoiceItem {
  description: string;
  qty: number;
  price: number;
}

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
}

export type InvoiceColumnInput = {
  id?: string;
  fieldKey: string;
  label: string;
  type: string;
  order: number;
  behavior: "ADD" | "SUBTRACT" | "NONE";
};


const Page = () => {
  const [invoiceData, setInvoiceData] = useState<InvoiceFormValues | null>(
    null
  );

  const [columns, setColumns] = useState<InvoiceColumnInput[]>([
    {
      fieldKey: "description",
      label: "Description",
      type: "text",
      behavior: "NONE",
      order: 1,
    },
    {
      fieldKey: "qty",
      label: "Qty",
      type: "number",
      behavior: "NONE",
      order: 2,
    },
    {
      fieldKey: "price",
      label: "Price",
      type: "number",
      behavior: "NONE",
      order: 3,
    },
  ]);


  const [addcolumnModalOpen, setAddColumnModalOpen] = useState(false);

  console.log('columns ', columns)

  return (
    <div className="min-h-screen  flex flex-col gap-8">
      <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow-lg p-6">
        <InvoiceForm onUpdate={setInvoiceData} setAddColumnModalOpen={setAddColumnModalOpen} />
      </div>

      <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow-lg p-6">
        <InvoicePreview data={invoiceData} />
      </div>
      <AddInvoiceColumnModal
        open={addcolumnModalOpen}
        onClose={() => setAddColumnModalOpen(false)}
        columns={columns}
        setColumns={setColumns}
      />
    </div>
  );
};

export default Page;
