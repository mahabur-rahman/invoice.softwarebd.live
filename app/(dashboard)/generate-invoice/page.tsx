"use client";
import { useState } from "react";
import InvoiceForm from "@/components/invoice/InvoiceForm";
import InvoicePreview from "@/components/invoice/InvoicePreview";

const Page = () => {
  const [invoiceData, setInvoiceData] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 flex flex-col gap-8">
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
