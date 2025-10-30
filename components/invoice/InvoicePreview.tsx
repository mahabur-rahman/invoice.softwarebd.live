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
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(`<html><head><title>Invoice</title></head><body>${printContents}</body></html>`);
      win.document.close();
      win.print();
      win.close();
    }
  };

  if (!data)
    return (
      <div className="bg-white rounded-xl shadow-md p-6 text-gray-500 flex items-center justify-center h-full">
        No invoice data yet.
      </div>
    );

  return (
    <div className="relative bg-white rounded-xl shadow-md p-6">
      <button
        onClick={handlePrint}
        className="absolute top-4 right-4 bg-blue-600 text-white text-sm px-3 py-1.5 rounded-md hover:bg-blue-700 transition"
      >
        Print
      </button>

      <div ref={printRef}>
      {  data.logo && (
        <Image
          src={data.logo || ""}
          alt="Company Logo"
          width={96}
          height={96}
          unoptimized
          className="w-24 h-24 object-contain mb-2"
        />
        )}

        {data.address && (
          <p className="text-gray-600 mb-4 text-sm whitespace-pre-line">
            {data.address}
          </p>
        )}

        <h2 className="text-2xl font-bold mb-4 text-gray-800">Invoice Preview</h2>

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
                <td className="text-center p-2 border">
                  ${item.price.toFixed(2)}
                </td>
                <td className="text-right p-2 border">
                  ${(item.qty * item.price).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-right text-gray-700">
          <p>Subtotal: ${data.subtotal.toFixed(2)}</p>
          <p>Discount: ${data.discount.toFixed(2)}</p>
          <p>Paid: ${data.paid.toFixed(2)}</p>
          <p className="font-bold text-lg mt-2">
            Amount Due: ${data.total.toFixed(2)}
          </p>
        </div>

        <div className="mt-4 text-sm text-gray-700">
          <p className="font-semibold">Notes:</p>
          <p>{data.notes}</p>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
