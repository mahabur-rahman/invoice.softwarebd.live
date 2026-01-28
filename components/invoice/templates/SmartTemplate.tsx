import Image from "next/image";
import { InvoiceTemplateProps } from "./types";
import { getCustomTotals } from "./utils";

const SmartTemplate = ({
  data,
  columns,
  business,
  client,
  formatDate,
  getValidImageUrl,
}: InvoiceTemplateProps) => {
  const visibleColumns = columns.filter((col) => !col.hidden);
  const customTotals = getCustomTotals(data);
  const logoUrl = getValidImageUrl(business?.logoUrl);

  return (
    <div className="relative overflow-hidden rounded-[30px] border border-amber-100 bg-white shadow-[0_30px_70px_rgba(88,28,135,0.18)] print:border-0 print:shadow-none">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-amber-50 via-white to-rose-50" />
      <div className="pointer-events-none absolute -left-32 top-12 h-56 w-56 rounded-full bg-amber-200/40" />
      <div className="pointer-events-none absolute -right-32 -top-24 h-64 w-64 rounded-full bg-rose-200/40" />
      <div className="pointer-events-none absolute right-10 bottom-16 h-40 w-40 rounded-full bg-fuchsia-200/30" />

      <div className="relative px-10 py-10">
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-[28px] bg-linear-to-br from-[#7f4a1d] via-[#5a2b73] to-[#3b1c59] p-6 text-white shadow-[0_20px_40px_rgba(88,28,135,0.35)]">
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">
              Smart Luxury Invoice
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[0.18em]">
              INVOICE
            </h2>
            <div className="mt-6 flex flex-wrap gap-3 text-xs">
              <span className="rounded-full bg-white/15 px-3 py-1">
                {data.status}
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1">
                Issue: {formatDate(data.issueDate)}
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1">
                Due: {formatDate(data.dueDate)}
              </span>
            </div>
          </div>

          <div className="rounded-[26px] border border-amber-100 bg-white/90 p-5 shadow-[0_12px_26px_rgba(120,53,15,0.15)]">
            <div className="flex items-center gap-4">
              {logoUrl && (
                <div className="rounded-2xl border border-amber-100 bg-white p-2">
                  <Image
                    alt="logo"
                    src={logoUrl}
                    className="h-12 w-auto"
                    width={160}
                    height={160}
                  />
                </div>
              )}
              <div className="text-sm text-amber-900">
                <p className="font-semibold text-amber-950">
                  {business?.companyName || "Company Name"}
                </p>
                <p className="text-xs text-amber-700">
                  {business?.contactEmail || ""}
                </p>
                <p className="text-xs text-amber-700">
                  {business?.location || ""}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50/70 p-3 text-xs text-amber-800">
              <div className="flex justify-between">
                <span>Invoice No</span>
                <span className="font-medium text-amber-950">
                  {data.invoiceNumber || "—"}
                </span>
              </div>
              <div className="mt-2 flex justify-between">
                <span>Currency</span>
                <span className="font-medium text-amber-950">
                  {data.currency}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-[26px] border border-amber-100 bg-white/90 p-6">
          <p className="text-xs uppercase tracking-[0.25em] text-amber-700">
            Bill To
          </p>
          <p className="mt-2 text-xl font-semibold text-amber-950">
            {client?.name || ""}
          </p>
          <p className="text-sm text-amber-700">{client?.address || ""}</p>
        </div>

        <div className="mt-8 overflow-hidden rounded-[26px] border border-amber-100 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-amber-950 text-amber-100">
              <tr>
                {visibleColumns.map((col) => (
                  <th
                    key={col.fieldKey}
                    className={`px-4 py-3 text-xs uppercase tracking-widest ${
                      col.type === "number" ? "text-right" : "text-left"
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
                  className={`border-t border-amber-100 ${
                    idx % 2 === 0 ? "bg-white" : "bg-amber-50/40"
                  }`}
                >
                  {visibleColumns.map((col) => (
                    <td
                      key={col.fieldKey}
                      className={`px-4 py-3 text-amber-900 ${
                        col.type === "number"
                          ? "text-right font-medium text-amber-950"
                          : "text-left"
                      }`}
                    >
                      {col.type === "number"
                        ? `${Number(item[col.fieldKey] || 0).toFixed(2)}`
                        : String(item[col.fieldKey] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-[26px] border border-amber-100 bg-white/90 p-5 text-sm text-amber-800">
            <p className="text-xs uppercase tracking-[0.25em] text-amber-600">
              Notes
            </p>
            <p className="mt-3 whitespace-pre-line">{data.notes}</p>
          </div>

          <div className="rounded-[26px] bg-linear-to-br from-[#3b1c59] via-[#5a2b73] to-[#7f4a1d] p-6 text-sm text-white shadow-[0_18px_40px_rgba(88,28,135,0.35)]">
            <div className="flex justify-between text-white/80">
              <span>Subtotal</span>
              <span className="font-semibold text-white">
                {data.currency} {Number(data.subtotal ?? 0).toFixed(2)}
              </span>
            </div>

            {customTotals.map((field) => {
              const signedAmount =
                field.behavior === "SUBTRACT" ? -field.amount : field.amount;
              return (
                <div
                  key={field.key}
                  className="mt-3 flex justify-between text-white/80"
                >
                  <span>{field.label}</span>
                  <span className="font-semibold text-white">
                    {data.currency} {Number(signedAmount ?? 0).toFixed(2)}
                  </span>
                </div>
              );
            })}

            <div className="mt-5 border-t border-white/20 pt-4 text-base font-semibold">
              <div className="flex justify-between">
                <span>Total Due</span>
                <span>
                  {data.currency} {Number(data.total ?? 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartTemplate;
