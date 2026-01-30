import Image from "next/image";
import { InvoiceTemplateProps } from "./types";
import { getCustomTotals, getRoleTotals } from "./utils";

const StandardTemplate = ({
  data,
  columns,
  business,
  client,
  formatDate,
  getValidImageUrl,
}: InvoiceTemplateProps) => {
  const visibleColumns = columns.filter((col) => !col.hidden);
  const customTotals = getCustomTotals(data);
  const roleTotals = getRoleTotals(data, columns);
  const paidAmount = Number(data.paid ?? 0);
  const balanceDue = Number(data.balanceDue ?? data.total ?? 0);
  const logoUrl = getValidImageUrl(business?.logoUrl);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)] print:border-0 print:shadow-none">
      <div className="border-b border-slate-200 bg-slate-50 px-8 py-6">
        <div className="flex flex-wrap items-center justify-between gap-6 print:flex-nowrap">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Invoice
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              {business?.companyName || "Company Name"}
            </h2>
            <p className="text-sm text-slate-500">
              {business?.contactEmail || ""}
            </p>
          </div>
          <div className="flex items-center gap-4">
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
            <div className="text-right text-sm text-slate-600">
              <p className="font-semibold text-slate-900">{data.status}</p>
              <p>Issue: {formatDate(data.issueDate)}</p>
              <p>Due: {formatDate(data.dueDate)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-8">
        <div className="grid gap-6 md:grid-cols-[1.4fr_1fr] print:grid-cols-[1.4fr_1fr]">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
              Bill To
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {client?.name || ""}
            </p>
            <p className="text-sm text-slate-500">{client?.address || ""}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>Invoice No</span>
              <span className="font-medium text-slate-900">
                {data.invoiceNumber || "—"}
              </span>
            </div>
            <div className="mt-2 flex justify-between">
              <span>Currency</span>
              <span className="font-medium text-slate-900">{data.currency}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-800 text-white">
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

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr] print:grid-cols-[1.3fr_1fr]">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
              Notes
            </p>
            <p className="mt-3 whitespace-pre-line">{data.notes}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">
                {data.currency} {Number(data.subtotal ?? 0).toFixed(2)}
              </span>
            </div>

            {roleTotals.hasDiscount && (
              <div className="mt-2 flex justify-between">
                <span>Total Discount</span>
                <span className="font-semibold text-slate-900">
                  - {data.currency}{" "}
                  {Number(roleTotals.discountTotal ?? 0).toFixed(2)}
                </span>
              </div>
            )}

            {customTotals.map((field) => {
              const signedAmount =
                field.behavior === "SUBTRACT" ? -field.amount : field.amount;
              return (
                <div key={field.key} className="mt-2 flex justify-between">
                  <span>{field.label}</span>
                  <span className="font-semibold text-slate-900">
                    {data.currency} {Number(signedAmount ?? 0).toFixed(2)}
                  </span>
                </div>
              );
            })}

            <div className="mt-4 border-t border-slate-200 pt-3 text-base font-semibold">
              <div className="flex justify-between">
                <span>Total</span>
                <span>
                  {data.currency} {Number(data.total ?? 0).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="mt-2 flex justify-between text-slate-600">
              <span>Paid</span>
              <span className="font-semibold text-slate-900">
                {data.currency} {paidAmount.toFixed(2)}
              </span>
            </div>
            <div className="mt-3 border-t border-slate-200 pt-3 text-base font-semibold">
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
  );
};

export default StandardTemplate;
