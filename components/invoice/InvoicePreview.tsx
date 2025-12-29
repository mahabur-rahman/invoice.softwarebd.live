"use client";

import { useRef } from "react";
import { useQuery } from "@apollo/client/react";
import { useReactToPrint, UseReactToPrintOptions } from "react-to-print";
import { InvoiceColumnInput } from "@/app/(dashboard)/(invoice)/generate-invoice/page";
import { FIND_ONE_CLIENT, SINGLE_BUSINESS_QUERY } from "@/lib/graphql/queries/invoice.queries";
import { SingleBusinessQueryResponse, SingleClientQueryResponse } from "@/lib/interfaces/responseTypes";
import Image from "next/image";

/* ================= TYPES ================= */

interface InvoiceItem {
  [key: string]: string | number;
}

interface InvoiceData {
  client: string;
  business: string;
  currency: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  notes: string;
  subtotal: number;
  discount: number;
  paid: number;
  total: number;
}

interface InvoicePreviewProps {
  data: InvoiceData | null;
  columns: InvoiceColumnInput[];
  showPrintButton?: boolean;
}

/* ================= COMPONENT ================= */

const InvoicePreview = ({ data, columns, showPrintButton }: InvoicePreviewProps) => {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: "Invoice",
    removeAfterPrint: true,
  } as UseReactToPrintOptions);

  const { data: businessData } = useQuery<SingleBusinessQueryResponse>(SINGLE_BUSINESS_QUERY, {
    skip: !data?.business,
    variables: { id: data?.business ?? "" },
  });

  const { data: clientData } = useQuery<SingleClientQueryResponse>(FIND_ONE_CLIENT, {
    skip: !data?.client,
    variables: { id: data?.client ?? "" },
  });

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No invoice data yet.
      </div>
    );
  }

  /* ================= RENDER ================= */

  return (
    <div className="relative">
      <div
        ref={componentRef}
        className="p-6 border border-gray-200 rounded-xl bg-white shadow-sm print:p-8 print:border-0"
      >
        {/* ================= COMPANY ================= */}

        <div className="flex justify-between border-b pb-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {businessData?.singleBusiness?.companyName || "Company Name"}
            </h2>
            <p className="text-sm text-gray-600">
              {businessData?.singleBusiness?.location || ""}
              <br />
              {businessData?.singleBusiness.contactEmail || ""}
            </p>
          </div>

          <div>
            {businessData?.singleBusiness?.logoUrl &&
              <Image
                alt="logo"
                src={businessData?.singleBusiness?.logoUrl || ""}
                className="h-16 w-auto"
                width={400}
                height={400}
              />
            }
          </div>

          <div className="text-right text-sm">
            <p>Issue: {data.issueDate || "—"}</p>
            <p>Due: {data.dueDate || "—"}</p>
          </div>
        </div>

        {/* ================= CLIENT ================= */}

        <div className="mb-4">
          <h3 className="font-semibold text-gray-700">Bill To:</h3>
          <p>{clientData?.findOneClient?.name || ""}</p>
          <p className="text-sm text-gray-600">
            {clientData?.findOneClient?.address || ""}
          </p>
        </div>

        {/* ================= ITEMS TABLE ================= */}

        <table className="w-full text-sm border border-gray-200 mb-4">
          <thead className="bg-gray-800 text-white">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.fieldKey}
                  className={`p-2 ${col.type === "number"
                    ? "text-right"
                    : "text-left"
                    }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.items.map((item, idx) => (
              <tr
                key={idx}
                className="border-t border-gray-200"
              >
                {columns.map((col) => (
                  <td
                    key={col.fieldKey}
                    className={`p-2 ${col.type === "number"
                      ? "text-right"
                      : "text-left"
                      }`}
                  >
                    {col.type === "number"
                      ? `${Number(
                        item[col.fieldKey] || 0
                      ).toFixed(2)}`
                      : String(item[col.fieldKey] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= TOTALS ================= */}

        <div className="text-right space-y-1 text-sm">
          <p>
            Subtotal: {data.currency}{" "}
            {data.subtotal.toFixed(2)}
          </p>
          <p>
            Discount: {data.currency}{" "}
            {data.discount.toFixed(2)}
          </p>
          <p>
            Paid: {data.currency}{" "}
            {data.paid.toFixed(2)}
          </p>

          <h3 className="text-lg font-semibold mt-2">
            Amount Due: {data.currency}{" "}
            {data.total.toFixed(2)}
          </h3>
        </div>

        {/* ================= NOTES ================= */}

        <div className="mt-4 border-t pt-4 text-sm text-gray-600">
          <p className="font-semibold">Notes:</p>
          <p>{data.notes}</p>
        </div>
      </div>

      {/* ================= PRINT ================= */}

      {
        showPrintButton &&

        <div className="flex justify-end mt-4">
          <button
            onClick={handlePrint}
            className="bg-gray-800 text-white px-4 py-2 rounded-md"
          >
            Print Invoice
          </button>
        </div>
      }
    </div>
  );
};

export default InvoicePreview;
