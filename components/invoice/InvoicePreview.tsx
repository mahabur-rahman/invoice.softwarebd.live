"use client";

import { InvoiceData } from "@/app/(dashboard)/generate-invoice/page";


interface InvoicePreviewProps {
  data: InvoiceData | null;
}

const InvoicePreview = ({ data }: InvoicePreviewProps) => {
  if (!data)
    return (
      <div className="bg-white rounded-xl shadow-md p-6 text-gray-500 flex items-center justify-center h-full">
        No invoice data yet.
      </div>
    );

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Preview</h2>

      {/* Client Info */}
      <div className="mb-4">
        <p className="font-semibold text-gray-700">Client:</p>
        <p>{data.client || "—"}</p>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-700">
        <div>
          <p>Issue Date: {data.issueDate || "—"}</p>
        </div>
        <div>
          <p>Due Date: {data.dueDate || "—"}</p>
        </div>
      </div>

      {/* Item Table */}
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

      {/* Summary */}
      <div className="text-right text-gray-700">
        <p>Subtotal: ${data.subtotal.toFixed(2)}</p>
        <p>Discount: ${data.discount.toFixed(2)}</p>
        <p>Paid: ${data.paid.toFixed(2)}</p>
        <p className="font-bold text-lg mt-2">
          Amount Due: ${data.total.toFixed(2)}
        </p>
      </div>

      {/* Notes */}
      <div className="mt-4 text-sm text-gray-700">
        <p className="font-semibold">Notes:</p>
        <p>{data.notes}</p>
      </div>
    </div>
  );
};

export default InvoicePreview;
