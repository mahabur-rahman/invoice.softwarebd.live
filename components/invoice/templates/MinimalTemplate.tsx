import Image from "next/image";
import { InvoiceTemplateProps } from "./types";
import { getCustomTotals } from "./utils";

const MinimalTemplate = ({
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
    <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-[0_18px_40px_rgba(15,23,42,0.08)] print:border-0 print:shadow-none">
      <div className="flex flex-wrap items-start justify-between gap-6 print:flex-nowrap">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Invoice
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">
            {business?.companyName || "Company Name"}
          </h2>
          <div className="mt-3 text-sm text-slate-500">
            <p>{business?.location || ""}</p>
            <p>{business?.contactEmail || ""}</p>
          </div>
        </div>

        <div className="text-right text-sm text-slate-500">
          {logoUrl && (
            <div className="mb-3 inline-flex rounded-xl border border-slate-200 bg-white p-2">
              <Image
                alt="logo"
                src={logoUrl}
                className="h-12 w-auto"
                width={200}
                height={200}
              />
            </div>
          )}
          <p>
            Issue: <span className="font-medium text-slate-900">{formatDate(data.issueDate)}</span>
          </p>
          <p>
            Due: <span className="font-medium text-slate-900">{formatDate(data.dueDate)}</span>
          </p>
          <p className="mt-2 inline-flex rounded-full border border-slate-200 px-3 py-1 text-xs uppercase tracking-wide text-slate-600">
            {data.status}
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 print:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
            Bill To
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {client?.name || ""}
          </p>
          <p className="text-sm text-slate-500">{client?.address || ""}</p>
        </div>
        <div className="text-sm text-slate-500">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
            Summary
          </p>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between">
              <span>Items</span>
              <span className="font-medium text-slate-900">{data.items.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Currency</span>
              <span className="font-medium text-slate-900">{data.currency}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 overflow-hidden border-y border-slate-200">
        <table className="w-full text-sm">
          <thead className="text-slate-400">
            <tr>
              {visibleColumns.map((col) => (
                <th
                  key={col.fieldKey}
                  className={`px-2 py-3 text-xs uppercase tracking-widest ${
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
              <tr key={idx} className="border-t border-slate-100 text-slate-600">
                {visibleColumns.map((col) => (
                  <td
                    key={col.fieldKey}
                    className={`px-2 py-3 ${
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

      <div className="mt-8 grid gap-6 md:grid-cols-[1.4fr_1fr] print:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
            Notes
          </p>
          <p className="mt-3 text-sm text-slate-500 whitespace-pre-line">
            {data.notes}
          </p>
        </div>

        <div className="text-sm">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span className="font-medium text-slate-900">
              {data.currency} {Number(data.subtotal ?? 0).toFixed(2)}
            </span>
          </div>

          {customTotals.map((field) => {
            const signedAmount =
              field.behavior === "SUBTRACT" ? -field.amount : field.amount;
            return (
              <div key={field.key} className="mt-2 flex justify-between text-slate-500">
                <span>{field.label}</span>
                <span className="font-medium text-slate-900">
                  {data.currency} {Number(signedAmount ?? 0).toFixed(2)}
                </span>
              </div>
            );
          })}

          <div className="mt-4 border-t border-slate-200 pt-3 text-base font-semibold text-slate-900">
            <div className="flex justify-between">
              <span>Total</span>
              <span>
                {data.currency} {Number(data.total ?? 0).toFixed(2)}
              </span>
            </div>
          </div>
          <div className="mt-2 flex justify-between text-slate-500">
            <span>Paid</span>
            <span className="font-medium text-slate-900">
              {data.currency} {paidAmount.toFixed(2)}
            </span>
          </div>
          <div className="mt-3 border-t border-slate-200 pt-3 text-base font-semibold text-slate-900">
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
  );
};

export default MinimalTemplate;
