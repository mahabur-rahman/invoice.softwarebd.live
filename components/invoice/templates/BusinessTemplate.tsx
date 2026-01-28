import Image from "next/image";
import { InvoiceTemplateProps } from "./types";
import { getCustomTotals } from "./utils";

const BusinessTemplate = ({
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
    <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)] print:border-0 print:shadow-none">
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white">
        <div className="absolute -right-20 -top-24 h-60 w-60 rounded-full bg-slate-700/30" />
        <div className="absolute -left-16 -bottom-20 h-60 w-60 rounded-full bg-slate-600/20" />
        <div className="relative flex flex-col gap-6 px-8 pb-10 pt-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-300">
                Invoice
              </p>
              <h2 className="text-3xl font-semibold">
                {business?.companyName || "Company Name"}
              </h2>
              <p className="text-sm text-slate-200">
                {business?.location || ""}
              </p>
              <p className="text-sm text-slate-200">
                {business?.contactEmail || ""}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2 text-sm">
              {logoUrl && (
                <Image
                  alt="logo"
                  src={logoUrl}
                  className="h-14 w-auto rounded bg-white/90 p-2"
                  width={200}
                  height={200}
                />
              )}
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wide">
                {data.status}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="rounded-xl bg-white/10 px-4 py-3">
              <p className="text-xs text-slate-300">Bill To</p>
              <p className="text-base font-semibold">{client?.name || ""}</p>
              <p className="text-xs text-slate-200">{client?.address || ""}</p>
            </div>
            <div className="flex gap-6">
              <div className="text-right">
                <p className="text-xs text-slate-300">Issue Date</p>
                <p className="text-base font-semibold">
                  {formatDate(data.issueDate)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-300">Due Date</p>
                <p className="text-base font-semibold">
                  {formatDate(data.dueDate)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              {visibleColumns.map((col) => (
                <th
                  key={col.fieldKey}
                  className={`py-3 text-xs uppercase tracking-wide ${
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
              <tr key={idx} className="border-b border-slate-100">
                {visibleColumns.map((col) => (
                  <td
                    key={col.fieldKey}
                    className={`py-3 ${
                      col.type === "number"
                        ? "text-right font-medium text-slate-700"
                        : "text-left text-slate-600"
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

        <div className="mt-8 flex flex-wrap justify-between gap-6">
          <div className="max-w-md text-sm text-slate-500">
            <p className="font-semibold text-slate-700">Notes</p>
            <p className="mt-2 whitespace-pre-line">{data.notes}</p>
          </div>

          <div className="min-w-[220px] rounded-xl bg-slate-50 p-4 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-700">
                {data.currency} {Number(data.subtotal ?? 0).toFixed(2)}
              </span>
            </div>

            {customTotals.map((field) => {
              const signedAmount =
                field.behavior === "SUBTRACT" ? -field.amount : field.amount;
              return (
                <div
                  key={field.key}
                  className="mt-2 flex justify-between text-slate-500"
                >
                  <span>{field.label}</span>
                  <span className="font-semibold text-slate-700">
                    {data.currency} {Number(signedAmount ?? 0).toFixed(2)}
                  </span>
                </div>
              );
            })}

            <div className="mt-4 border-t border-slate-200 pt-3 text-base font-semibold text-slate-900">
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

export default BusinessTemplate;
