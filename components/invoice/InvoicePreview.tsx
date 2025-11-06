"use client";

import { useRef } from "react";
import Image from "next/image";
import { InvoiceData } from "@/app/(dashboard)/generate-invoice/page";

interface InvoicePreviewProps {
  data: InvoiceData | null;
}

const InvoicePreview = ({ data }: InvoicePreviewProps) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printRef.current) return;
    const printContents = printRef.current.innerHTML;
    const printWindow = window.open("", "", "width=800,height=900");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice</title>
            <style>
              @page {
                size: A4;
                margin: 0;
              }
              body {
                margin: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                background: #fff;
              }
              .print-container {
                width: 90%;
                max-width: 800px;
                padding: 40px;
                box-sizing: border-box;
                font-family: sans-serif;
              }
              table {
                width: 100%;
                border-collapse: collapse;
              }
              th, td {
                border: 1px solid #ccc;
                padding: 8px;
                text-align: left;
              }
              th {
                background: #f3f4f6;
              }
              h2, p {
                margin: 0;
              }
            </style>
          </head>
          <body>
            <div class="print-container">${printContents}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  if (!data)
    return (
      <div className="bg-white rounded-xl shadow-md p-6 text-gray-500 flex items-center justify-center h-full">
        No invoice data yet.
      </div>
    );

  return (
    <div className="relative bg-white rounded-xl shadow-md p-6" ref={printRef}>
      <button
        onClick={handlePrint}
        className="absolute top-4 right-4 bg-blue-600 text-white text-sm px-3 py-1.5 rounded-md hover:bg-blue-700 transition"
      >
        Print
      </button>

      <div className="flex items-start mb-6">
        {data.logo && (
          <Image
            src={data.logo}
            alt="Company Logo"
            width={96}
            height={96}
            unoptimized
            className="w-24 h-24 object-contain mr-4"
          />
        )}
        <div>
          <p className="text-xl font-bold text-gray-800">{data.creatorCompany}</p>
          <p className="text-gray-600 text-sm whitespace-pre-line">{data.address}</p>
        </div>
      </div>

      <div className="mb-2">
        <p className="font-semibold text-gray-700">Client:</p>
        <p>{data.client || "—"}</p>
      </div>

      <div className="mb-4">
        <p className="font-semibold text-gray-700">Company:</p>
        <p>{data.clientCompany || "—"}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-700">
        <div>
          <p>Issue Date: {data.issueDate || "—"}</p>
        </div>
        <div>
          <p>Due Date: {data.dueDate || "—"}</p>
        </div>
      </div>

      <table className="w-full border border-gray-200 text-sm mb-4">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-2 border">Description</th>
            <th className="text-center p-2 border">Qty</th>
            <th className="text-center p-2 border">Price</th>
            <th className="text-right p-2 border">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, i) => (
            <tr key={i}>
              <td className="p-2 border">{item.description || "—"}</td>
              <td className="text-center p-2 border">{item.qty}</td>
              <td className="text-center p-2 border">${item.price.toFixed(2)}</td>
              <td className="text-right p-2 border">${(item.qty * item.price).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-right text-gray-700">
        <p>Subtotal: ${data.subtotal.toFixed(2)}</p>
        <p>Discount: ${data.discount.toFixed(2)}</p>
        <p>Paid: ${data.paid.toFixed(2)}</p>
        <p className="font-bold text-lg mt-2">Amount Due: ${data.total.toFixed(2)}</p>
      </div>

      <div className="mt-4 text-sm text-gray-700">
        <p className="font-semibold">Notes:</p>
        <p>{data.notes}</p>
      </div>
    </div>
  );
};

export default InvoicePreview;
