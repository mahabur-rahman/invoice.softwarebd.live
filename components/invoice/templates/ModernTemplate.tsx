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
      <div className="relative px-6 py-8 sm:px-10 sm:py-10 print:px-6 print:py-6">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:flex-nowrap md:items-center md:justify-between md:gap-6 print:flex-row print:flex-nowrap print:items-center print:justify-between print:gap-5">
          <div className="flex h-20 w-full max-w-[520px] items-center justify-center rounded-[32px] bg-teal-600 text-white sm:h-24 sm:w-[520px] md:h-[72px] md:w-[420px] md:max-w-none md:flex-shrink-0 print:h-[60px] print:w-[300px] print:max-w-none print:flex-shrink-0">
            <h2 className="text-3xl font-semibold tracking-[0.2em] sm:text-4xl sm:tracking-[0.25em] md:text-3xl md:tracking-[0.18em] print:text-2xl print:tracking-[0.12em]">
              INVOICE
            </h2>
          </div>

          <div className="flex w-full items-center justify-end gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:w-auto md:ml-auto md:w-[460px] md:max-w-none md:flex-shrink-0 md:px-5 md:py-4 print:ml-auto print:w-[360px] print:max-w-none print:flex-shrink-0 print:gap-3 print:px-3 print:py-2">
            {logoUrl && (
              <div className="rounded-xl border border-slate-200 bg-white p-2">
                <Image
                  alt="logo"
                  src={logoUrl}
                  className="h-8 w-auto print:h-7"
                  width={96}
                  height={96}
                />
              </div>
            )}
            <div className="flex min-w-0 flex-col text-sm text-slate-600 print:text-xs">
              <p className="text-base font-semibold text-slate-900 print:text-sm whitespace-nowrap">
                {business?.companyName || "Brand Name"}
              </p>
              <p className="text-xs text-teal-700">
                {business?.contactEmail || "Tagline here"}
              </p>
              <p className="text-xs text-slate-500">
                {business?.phoneNumber || ""}
              </p>
            </div>
          </div>
        </div>

        {/* Meta cards */}
        <div className="mt-10 grid gap-6 md:grid-cols-[1.3fr_1fr] print:grid-cols-[1.3fr_1fr]">
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
        <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 print:overflow-visible">
          <table className="w-full text-sm">
            <thead className="bg-teal-600 text-white print:border-b print:border-teal-700">
              <tr className="print:border-b print:border-teal-700">
                {visibleColumns.map((col) => (
                  <th
                    key={col.fieldKey}
                    className={`px-4 py-3 text-xs uppercase tracking-widest print:border-b print:border-teal-700 ${
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
        <div className="mt-8 grid gap-6 md:grid-cols-[1.3fr_1fr] print:grid-cols-[1.3fr_1fr]">
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
