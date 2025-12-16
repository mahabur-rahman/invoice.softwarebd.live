"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import InvoicePreview from "@/components/invoice/InvoicePreview";
import { InvoiceColumnInput } from "@/app/(dashboard)/(invoice)/generate-invoice/page";
import { SINGLE_INVOICE_QUERY } from "@/lib/graphql/queries/invoice.queries";

/* ================= TYPES ================= */

interface SingleInvoiceQueryResponse {
  singleInvoice: {
    _id: string;
    businessId: string;
    clientId: string;
    currency: string;
    issueDate: string;
    dueDate: string;
    notes?: string;
    columns: InvoiceColumnInput[];
    items: {
      values: Record<string, string | number>;
    }[];
    totals: {
      subTotal: number;
      grandTotal: number;
      subtractions?: Record<string, number>;
    };
  };
}

/* ================= PAGE ================= */

const Page = () => {
  const params = useParams();
  const invoiceId = params.id as string;

  const { data, loading } = useQuery<SingleInvoiceQueryResponse>(
    SINGLE_INVOICE_QUERY,
    {
      variables: { id: invoiceId },
      skip: !invoiceId,
    }
  );

  /* ================= ADAPT DATA FOR PREVIEW ================= */

  const previewData = useMemo(() => {
    if (!data?.singleInvoice) return null;

    const invoice = data.singleInvoice;

    return {
      client: invoice.clientId,
      business: invoice.businessId,
      currency: invoice.currency,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      notes: invoice.notes ?? "",
      subtotal: invoice.totals.subTotal,
      discount: invoice.totals.subtractions?.discount ?? 0,
      paid: 0,
      total: invoice.totals.grandTotal,

      items: invoice.items.map((item) => ({
        ...item.values,
        total: Number(item?.values),
      })),
    };
  }, [data]);

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-gray-500">
        Loading invoice…
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <InvoicePreview
        data={previewData}
        columns={data?.singleInvoice.columns ?? []}
      />
    </div>
  );
};

export default Page;
