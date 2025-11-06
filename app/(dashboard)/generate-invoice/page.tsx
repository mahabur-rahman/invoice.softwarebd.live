"use client";

import { useState } from "react";
import InvoiceForm from "@/components/invoice/InvoiceForm";
import InvoicePreview from "@/components/invoice/InvoicePreview";

interface InvoiceItem {
  description: string;
  qty: number;
  price: number;
}

export interface InvoiceData {
  client: string;
  clientCompany: string;
  currency: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  notes: string;
  subtotal: number;
  discount: number;
  paid: number;
  total: number;
  logo: string | null;
  address: string;
  creatorCompany: string;
}

const Page = () => {
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("invoiceData");
        return saved ? (JSON.parse(saved) as InvoiceData) : null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const handleUpdate = (data: InvoiceData) => {
    setInvoiceData(data);
    localStorage.setItem("invoiceData", JSON.stringify(data));
  };

  return (
    <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
      <InvoiceForm onUpdate={handleUpdate} />
      <InvoicePreview data={invoiceData} />
    </div>
  );
};

export default Page;
