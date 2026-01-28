import Image from "next/image";
import { InvoiceTemplateProps } from "./types";
import { getCustomTotals } from "./utils";

const SimpleTemplate = ({
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
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)] print:border-0 print:shadow-none">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Invoice</h2>
          <p className="mt-1 text-sm text-slate-500">
            {formatDate(data.issueDate)} • {formatDate(data.dueDate)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {logoUrl && (
            <Image
              alt="logo"
              src={logoUrl}
              className="h-10 w-auto"
              width={160}
              height={160}
            />
          )}
          <div className="text-sm text-slate-600">
            <p className="font-semibold text-slate-900">
              {business?.companyName || "Company Name"}
            </p>
            <p className="text-xs text-slate-400">
              {business?.contactEmail || ""}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Bill To
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {client?.name || ""}
          </p>
          <p className="text-sm text-slate-500">{client?.address || ""}</p>
        </div>
        <div className="rounded-xl border border-slate-200 p-4 text-sm text-slate-600">
          <div className="flex justify-between">
            <span>Invoice No</span>
            <span className="font-medium text-slate-900">—</span>
          </div>
          <div className="mt-2 flex justify-between">
            <span>Status</span>
            <span className="font-medium text-slate-900">{data.status}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-500">
            <tr>
              {visibleColumns.map((col) => (
                <th
                  key={col.fieldKey}
                  className={`px-3 py-2 text-xs uppercase tracking-widest ${
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
              <tr key={idx} className="border-t border-slate-200">
                {visibleColumns.map((col) => (
                  <td
                    key={col.fieldKey}
                    className={`px-3 py-2 text-slate-600 ${
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

      <div className="mt-6 grid gap-6 md:grid-cols-[1.3fr_1fr]">
        <div className="text-sm text-slate-500">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Notes
          </p>
          <p className="mt-2 whitespace-pre-line">{data.notes}</p>
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
        </div>
      </div>
    </div>
  );
};

export default SimpleTemplate;
