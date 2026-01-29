import Image from "next/image";
import { InvoiceTemplateProps } from "./types";
import { getCustomTotals } from "./utils";

const ModernTemplate = ({
  data,
  columns,
  business,
  client,
  formatDate,
  getValidImageUrl,
}: InvoiceTemplateProps) => {
  const visibleColumns = columns.filter((col) => !col.hidden);
  const customTotals = getCustomTotals(data);
  const paidAmount = Number(data.paid ?? 0);
  const balanceDue = Number(data.balanceDue ?? data.total ?? 0);
  const logoUrl = getValidImageUrl(business?.logoUrl);

  return (
    <div className="relative overflow-hidden rounded-[28px] bg-white shadow-[0_30px_70px_rgba(15,23,42,0.14)] print:shadow-none">
      <div className="relative px-10 py-10">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex h-24 w-[520px] items-center justify-center rounded-[32px] bg-teal-600 text-white">
            <h2 className="text-4xl font-semibold tracking-[0.25em]">
              INVOICE
            </h2>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            {logoUrl && (
              <div className="rounded-xl border border-slate-200 bg-white p-2">
                <Image
                  alt="logo"
                  src={logoUrl}
                  className="h-12 w-auto"
                  width={160}
                  height={160}
                />
              </div>
            )}
            <div className="text-sm text-slate-600">
              <p className="font-semibold text-slate-900">
                {business?.companyName || "Brand Name"}
              </p>
              <p className="text-xs text-slate-400">
                {business?.contactEmail || "Tagline here"}
              </p>
            </div>
          </div>
        </div>

        {/* Meta cards */}
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Invoice To
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {client?.name || ""}
            </p>
            <p className="text-sm text-slate-500">{client?.address || ""}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>Invoice No</span>
              <span className="font-medium text-slate-900">
                {data.invoiceNumber || "—"}
              </span>
            </div>
            <div className="mt-2 flex justify-between">
              <span>Date</span>
              <span className="font-medium text-slate-900">
                {formatDate(data.issueDate)}
              </span>
            </div>
            <div className="mt-2 flex justify-between">
              <span>Due Date</span>
              <span className="font-medium text-slate-900">
                {formatDate(data.dueDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-teal-600 text-white">
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
                <tr key={idx} className="border-t border-slate-200 text-slate-600">
                  {visibleColumns.map((col) => (
                    <td
                      key={col.fieldKey}
                      className={`px-4 py-3 ${
                        col.type === "number"
                          ? "text-right font-medium text-slate-900"
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

        {/* Notes + Totals */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Terms & Conditions
            </p>
            <p className="mt-3 whitespace-pre-line">{data.notes}</p>

            <div className="mt-8">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Signature
              </p>
              <div className="mt-4 h-8 w-48 border-b border-slate-300" />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-teal-700 p-5 text-sm text-white">
            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/10" />
            <div className="absolute -left-6 -bottom-8 h-24 w-24 rounded-full bg-white/10" />

            <div className="relative">
              <div className="flex justify-between text-teal-100">
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
                    className="mt-3 flex justify-between text-teal-100"
                  >
                    <span>{field.label}</span>
                    <span className="font-semibold text-white">
                      {data.currency} {Number(signedAmount ?? 0).toFixed(2)}
                    </span>
                  </div>
                );
              })}

              <div className="mt-5 border-t border-white/30 pt-4 text-base font-semibold">
                <div className="flex justify-between">
                  <span>Total</span>
                  <span>
                    {data.currency} {Number(data.total ?? 0).toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex justify-between text-teal-100">
                <span>Paid</span>
                <span className="font-semibold text-white">
                  {data.currency} {paidAmount.toFixed(2)}
                </span>
              </div>
              <div className="mt-3 border-t border-white/30 pt-4 text-base font-semibold">
                <div className="flex justify-between">
                  <span>Balance Due</span>
                  <span>
                    {data.currency} {balanceDue.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernTemplate;
