import Image from "next/image";
import { InvoiceTemplateProps } from "./types";
import { getCustomTotals } from "./utils";

const ElegantTemplate = ({
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
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_30px_60px_rgba(15,23,42,0.12)] print:border-0 print:shadow-none">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-52 w-52 rounded-full bg-amber-300/40" />
      <div className="pointer-events-none absolute -right-32 -top-32 h-64 w-64 rounded-full bg-fuchsia-400/30" />
      <div className="pointer-events-none absolute -left-28 -bottom-28 h-60 w-60 rounded-full bg-cyan-300/40" />
      <div className="pointer-events-none absolute -right-24 -bottom-24 h-52 w-52 rounded-full bg-lime-300/30" />

      <div className="relative px-10 py-10">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
              Invoice
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">
              {business?.companyName || "Company Name"}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {business?.location || ""}
            </p>
            <p className="text-sm text-slate-500">
              {business?.contactEmail || ""}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-full bg-slate-900 px-4 py-2 text-xs uppercase tracking-wide text-white">
                {data.status}
              </div>
              <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-500">
                Issue: <span className="font-semibold text-slate-800">{formatDate(data.issueDate)}</span>
              </div>
              <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-500">
                Due: <span className="font-semibold text-slate-800">{formatDate(data.dueDate)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-4">
            {logoUrl && (
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-3">
                <Image
                  alt="logo"
                  src={logoUrl}
                  className="h-14 w-auto"
                  width={200}
                  height={200}
                />
              </div>
            )}
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-right text-sm text-slate-600">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                Bill To
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {client?.name || ""}
              </p>
              <p className="text-sm text-slate-500">{client?.address || ""}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white/80">
          <table className="w-full text-sm">
            <thead className="bg-slate-900 text-white">
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
                  className={`border-t border-slate-200 ${
                    idx % 2 === 0 ? "bg-white" : "bg-slate-50"
                  }`}
                >
                  {visibleColumns.map((col) => (
                    <td
                      key={col.fieldKey}
                      className={`px-4 py-3 ${
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
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 text-sm text-slate-600">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
              Notes
            </p>
            <p className="mt-3 whitespace-pre-line">{data.notes}</p>
          </div>

          <div className="rounded-2xl bg-slate-900 p-5 text-sm text-white shadow-[0_20px_40px_rgba(15,23,42,0.3)]">
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

export default ElegantTemplate;
