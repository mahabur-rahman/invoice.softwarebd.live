import Image from "next/image";
import { InvoiceTemplateProps } from "./types";
import { getCustomTotals } from "./utils";

const CleanTemplate = ({
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
    <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_20px_45px_rgba(15,23,42,0.08)] print:border-0 print:shadow-none">
      <div className="flex flex-wrap items-center justify-between gap-6 border-b border-slate-200 bg-slate-50 px-8 py-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
            Invoice
          </p>
          <h2 className="text-2xl font-semibold text-slate-900">
            {business?.companyName || "Company Name"}
          </h2>
          <div className="text-sm text-slate-500">
            <p>{business?.location || ""}</p>
            <p>{business?.contactEmail || ""}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {logoUrl && (
            <div className="rounded-xl border border-slate-200 bg-white p-2">
              <Image
                alt="logo"
                src={logoUrl}
                className="h-12 w-auto"
                width={200}
                height={200}
              />
            </div>
          )}
          <div className="text-right text-sm text-slate-600">
            <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs uppercase tracking-wide text-slate-500">
              {data.status}
            </div>
            <p className="mt-3">
              Issue: <span className="font-medium">{formatDate(data.issueDate)}</span>
            </p>
            <p>
              Due: <span className="font-medium">{formatDate(data.dueDate)}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="px-8 py-8">
        <div className="mb-6 grid gap-6 md:grid-cols-[1.3fr_1fr]">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Bill To
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {client?.name || ""}
            </p>
            <p className="text-sm text-slate-500">{client?.address || ""}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Invoice Details
            </p>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Currency</span>
                <span className="font-medium text-slate-900">{data.currency}</span>
              </div>
              <div className="flex justify-between">
                <span>Items</span>
                <span className="font-medium text-slate-900">{data.items.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount Due</span>
                <span className="font-semibold text-slate-900">
                  {balanceDue.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-500">
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
                  className="border-t border-slate-200 text-slate-600"
                >
                  {visibleColumns.map((col) => (
                    <td
                      key={col.fieldKey}
                      className={`px-4 py-3 ${
                        col.type === "number"
                          ? "text-right font-medium text-slate-700"
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

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Notes
            </p>
            <p className="mt-3 whitespace-pre-line text-slate-600">{data.notes}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-900 p-5 text-sm text-white">
            <div className="flex justify-between text-slate-200">
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
                  className="mt-3 flex justify-between text-slate-200"
                >
                  <span>{field.label}</span>
                  <span className="font-semibold text-white">
                    {data.currency} {Number(signedAmount ?? 0).toFixed(2)}
                  </span>
                </div>
              );
            })}

            <div className="mt-3 flex justify-between text-slate-200">
              <span>Paid</span>
              <span className="font-semibold text-white">
                {data.currency} {paidAmount.toFixed(2)}
              </span>
            </div>

            <div className="mt-5 border-t border-white/20 pt-4 text-base font-semibold">
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

export default CleanTemplate;
