"use client";

import { useState } from "react";
import InvoiceForm from "@/components/invoice/InvoiceForm";
import InvoicePreview from "@/components/invoice/InvoicePreview";

interface InvoiceItem {
  description: string;
  qty: number;
  price: number;
}

export interface InvoiceFormValues {
  client: string;
  clientCompany: string;
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

const Page = () => {
  const [invoiceData, setInvoiceData] = useState<InvoiceFormValues | null>(null);

  return (
    <div className="min-h-screen  flex flex-col gap-8">
      <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow-lg p-6">
        <InvoiceForm onUpdate={setInvoiceData} />
      </div>

      <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow-lg p-6">
        <InvoicePreview data={invoiceData} />
      </div>
    </div>
  );
};

export default Page;
