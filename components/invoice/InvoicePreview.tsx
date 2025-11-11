"use client";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

const InvoicePreview = ({ data }) => {
  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "Invoice",
  });

  if (!data)
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No invoice data yet.
      </div>
    );

  return (
    <div className="relative">
      <button
        onClick={handlePrint}
        className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition text-sm"
      >
        Print
      </button>

      <div
        ref={componentRef}
        className="p-6 border border-gray-200 rounded-xl bg-white shadow-sm print:p-8 print:shadow-none"
      >
        {/* Static Company Info */}
        <div className="flex items-start justify-between border-b pb-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Apex Solutions Ltd.</h2>
            <p className="text-sm text-gray-600">
              123 Business Avenue, New York, USA
              <br />
              contact@apexsolutions.com
            </p>
          </div>
          <div className="text-right text-sm text-gray-700">
            <p>Issue: {data.issueDate || "—"}</p>
            <p>Due: {data.dueDate || "—"}</p>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold text-gray-700">Bill To:</h3>
          <p className="text-gray-800">{data.client}</p>
          <p className="text-gray-600 text-sm">{data.clientCompany}</p>
        </div>

        <table className="w-full text-sm border border-gray-200 mb-4">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="text-left p-2">Description</th>
              <th className="text-center p-2">Qty</th>
              <th className="text-center p-2">Price</th>
              <th className="text-right p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((i, idx) => (
              <tr key={idx} className="border-t border-gray-200">
                <td className="p-2">{i.description}</td>
                <td className="text-center p-2">{i.qty}</td>
                <td className="text-center p-2">
                  {data.currency} {i.price.toFixed(2)}
                </td>
                <td className="text-right p-2 font-medium">
                  {data.currency} {(i.qty * i.price).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-right space-y-1 text-sm text-gray-700">
          <p>Subtotal: {data.currency} {data.subtotal.toFixed(2)}</p>
          <p>Discount: {data.currency} {data.discount.toFixed(2)}</p>
          <p>Paid: {data.currency} {data.paid.toFixed(2)}</p>
          <h3 className="text-lg font-semibold text-blue-700 mt-2">
            Amount Due: {data.currency} {data.total.toFixed(2)}
          </h3>
        </div>

        <div className="mt-4 border-t pt-4 text-sm text-gray-600">
          <p className="font-semibold text-gray-700">Notes:</p>
          <p>{data.notes}</p>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
