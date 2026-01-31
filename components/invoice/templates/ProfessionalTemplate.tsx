import Image from "next/image";
import { InvoiceTemplateProps } from "./types";
import { getCustomTotals, getRoleTotals } from "./utils";
import TermsBlock from "./TermsBlock";

const ProfessionalTemplate = ({
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
  const showTerms = Boolean(data.terms) || Boolean(data.notes?.trim());

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-[0_26px_60px_rgba(15,23,42,0.12)] print:border-0 print:shadow-none">
      <div className="bg-slate-900 text-white">
        <div className="flex flex-wrap items-center justify-between gap-6 px-10 py-8 print:flex-nowrap">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">
              Invoice
            </p>
            <h2 className="mt-2 text-3xl font-semibold">{data.status}</h2>
            <p className="mt-2 text-sm text-white/70">
              Issued: {formatDate(data.issueDate)}
            </p>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-white/10 px-4 py-3">
            {logoUrl && (
              <div className="rounded-xl bg-white/90 p-2">
                <Image
                  alt="logo"
                  src={logoUrl}
                  className="h-12 w-auto"
                  width={160}
                  height={160}
                />
              </div>
            )}
            <div className="text-sm">
              <p className="font-semibold text-white">
                {business?.companyName || "Company Name"}
              </p>
              <p className="text-xs text-white/60">
                {business?.contactEmail || ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-10 py-8">
        <div className="grid gap-6 md:grid-cols-[1.4fr_1fr] print:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
              Bill To
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

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200">
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
                <tr key={idx} className="border-t border-slate-200">
                  {visibleColumns.map((col) => (
                    <td
                      key={col.fieldKey}
                      className={`px-4 py-3 text-slate-600 ${
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
          {showTerms && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
              <TermsBlock
                terms={data.terms}
                notes={data.notes}
                headingClassName="text-xs uppercase tracking-[0.25em] text-slate-400"
              />
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-slate-900 p-5 text-sm text-white">
            <div className="flex justify-between text-slate-300">
              <span>Subtotal</span>
              <span className="font-semibold text-white">
                {data.currency} {Number(data.subtotal ?? 0).toFixed(2)}
              </span>
            </div>

            {roleTotals.hasDiscount && (
              <div className="mt-3 flex justify-between text-slate-300">
                <span>Total Discount</span>
                <span className="font-semibold text-white">
                  - {data.currency}{" "}
                  {Number(roleTotals.discountTotal ?? 0).toFixed(2)}
                </span>
              </div>
            )}

            {customTotals.map((field) => {
              const signedAmount =
                field.behavior === "SUBTRACT" ? -field.amount : field.amount;
              return (
                <div
                  key={field.key}
                  className="mt-3 flex justify-between text-slate-300"
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
                <span>Total</span>
                <span>
                  {data.currency} {Number(data.total ?? 0).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="mt-3 flex justify-between text-slate-300">
              <span>Paid</span>
              <span className="font-semibold text-white">
                {data.currency} {paidAmount.toFixed(2)}
              </span>
            </div>
            <div className="mt-3 border-t border-white/20 pt-4 text-base font-semibold">
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

export default ProfessionalTemplate;
