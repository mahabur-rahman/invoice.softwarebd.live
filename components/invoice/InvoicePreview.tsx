"use client";

import { useMemo, useRef } from "react";
import { useQuery } from "@apollo/client/react";
import { useReactToPrint, UseReactToPrintOptions } from "react-to-print";
import { InvoiceColumnInput } from "@/app/(dashboard)/(invoice)/generate-invoice/page";
import {
  FIND_ONE_CLIENT,
  SINGLE_BUSINESS_QUERY,
} from "@/lib/graphql/queries/invoice.queries";
import {
  SingleBusinessQueryResponse,
  SingleClientQueryResponse,
} from "@/lib/interfaces/responseTypes";
import {
  INVOICE_TEMPLATE_OPTIONS,
  TEMPLATE_COMPONENTS,
  InvoiceTemplateKey,
} from "./templates";
import { InvoiceData } from "./templates/types";

/* ================= TYPES ================= */

interface InvoicePreviewProps {
  data: InvoiceData | null;
  columns: InvoiceColumnInput[];
  showPrintButton?: boolean;
  template?: InvoiceTemplateKey;
  onTemplateChange?: (template: InvoiceTemplateKey) => void;
}

const formatDate = (value?: string) => {
  if (!value) return "—";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const [datePart] = value.split("T");
  if (datePart) return datePart;
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().substring(0, 10);
  }
  return value;
};

const getValidImageUrl = (value?: string | null) => {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("/")) return trimmed;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
};

/* ================= COMPONENT ================= */

const InvoicePreview = ({
  data,
  columns,
  showPrintButton,
  template = "CLASSIC",
  onTemplateChange,
}: InvoicePreviewProps) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const activeTemplate = template ?? data?.template ?? "CLASSIC";
  const TemplateComponent =
    TEMPLATE_COMPONENTS[activeTemplate] ?? TEMPLATE_COMPONENTS.CLASSIC;

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: "Invoice",
    removeAfterPrint: true,
  } as UseReactToPrintOptions);

  const { data: businessData } = useQuery<SingleBusinessQueryResponse>(
    SINGLE_BUSINESS_QUERY,
    {
      skip: !data?.business,
      variables: { id: data?.business ?? "" },
    }
  );

  const { data: clientData } = useQuery<SingleClientQueryResponse>(
    FIND_ONE_CLIENT,
    {
      skip: !data?.client,
      variables: { id: data?.client ?? "" },
    }
  );

  const templateCards = useMemo(
    () =>
      INVOICE_TEMPLATE_OPTIONS.map((option) => ({
        ...option,
        isActive: option.key === activeTemplate,
      })),
    [activeTemplate]
  );

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No invoice data yet.
      </div>
    );
  }

  return (
    <div className="relative">
      {onTemplateChange && (
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">
              Choose template
            </p>
            <span className="text-xs text-gray-400">
              {activeTemplate} selected
            </span>
          </div>
          <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
            {templateCards.map((card) => (
              <button
                key={card.key}
                type="button"
                onClick={() => onTemplateChange(card.key)}
                className={`min-w-[120px] rounded-lg border p-2 text-left transition ${
                  card.isActive
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                }`}
                aria-pressed={card.isActive}
              >
                <div
                  className={`h-10 rounded-md border ${
                    card.isActive
                      ? "border-white/40 bg-white/10"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div
                    className={`h-2 rounded-t-md ${
                      card.key === "BUSINESS"
                        ? "bg-slate-900"
                        : "bg-gray-300"
                    }`}
                  />
                  <div className="mt-2 h-2 w-3/4 rounded bg-gray-300/70" />
                  <div className="mt-2 h-2 w-1/2 rounded bg-gray-300/50" />
                </div>
                <p className="mt-2 text-xs font-semibold">{card.label}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div ref={componentRef}>
        <TemplateComponent
          data={data}
          columns={columns}
          business={businessData?.singleBusiness}
          client={clientData?.findOneClient}
          formatDate={formatDate}
          getValidImageUrl={getValidImageUrl}
        />
      </div>

      {showPrintButton && (
        <div className="flex justify-end mt-4">
          <button
            onClick={handlePrint}
            className="bg-gray-800 text-white px-4 py-2 rounded-md"
          >
            Print Invoice
          </button>
        </div>
      )}
    </div>
  );
};

export default InvoicePreview;
