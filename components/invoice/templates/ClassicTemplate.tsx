import Image from "next/image";
import { InvoiceTemplateProps } from "./types";
import { getCustomTotals, getRoleTotals } from "./utils";
import TermsBlock from "./TermsBlock";

const ClassicTemplate = ({
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
  const showTerms = Boolean(data.terms) || Boolean(data.notes?.trim());
  const logoUrl = getValidImageUrl(business?.logoUrl);

  return (
    <div className="p-6 border border-gray-200 rounded-xl bg-white shadow-sm print:p-8 print:border-0">
      {/* ================= COMPANY ================= */}
      <div className="flex justify-between border-b pb-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {business?.companyName || "Company Name"}
          </h2>
          <p className="text-sm text-gray-600">
            {business?.location || ""}
            <br />
            {business?.contactEmail || ""}
          </p>
        </div>

        <div>
          {logoUrl && (
            <Image
              alt="logo"
              src={logoUrl}
              className="h-16 w-auto"
              width={400}
              height={400}
            />
          )}
        </div>

        <div className="text-right text-sm">
          <p className="text-3xl font-semibold">{data.status}</p>
          <p>Issue: {formatDate(data.issueDate)}</p>
          <p>Due: {formatDate(data.dueDate)}</p>
        </div>
      </div>

      {/* ================= CLIENT ================= */}
      <div className="mb-4">
        <h3 className="font-semibold text-gray-700">Bill To:</h3>
        <p>{client?.name || ""}</p>
        <p className="text-sm text-gray-600">{client?.address || ""}</p>
      </div>

      {/* ================= ITEMS TABLE ================= */}
      <table className="w-full text-sm border border-gray-200 mb-4">
        <thead className="bg-gray-800 text-white">
          <tr>
            {visibleColumns.map((col) => (
              <th
                key={col.fieldKey}
                className={`p-2 ${
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
            <tr key={idx} className="border-t border-gray-200">
              {visibleColumns.map((col) => (
                <td
                  key={col.fieldKey}
                  className={`p-2 ${
                    col.type === "number" ? "text-right" : "text-left"
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

      {/* ================= TOTALS ================= */}
      <div className="text-right space-y-1 text-sm">
        <p>
          Subtotal: {data.currency} {Number(data.subtotal ?? 0).toFixed(2)}
        </p>

        {roleTotals.hasDiscount && (
          <p>
            Total Discount: - {data.currency}{" "}
            {Number(roleTotals.discountTotal ?? 0).toFixed(2)}
          </p>
        )}

        {customTotals.map((field) => {
          const signedAmount =
            field.behavior === "SUBTRACT" ? -field.amount : field.amount;
          return (
            <p key={field.key}>
              {field.label}: {data.currency}{" "}
              {Number(signedAmount ?? 0).toFixed(2)}
            </p>
          );
        })}

        <p>
          Paid: {data.currency} {paidAmount.toFixed(2)}
        </p>

        <h3 className="text-lg font-semibold mt-2">
          Amount Due: {data.currency} {balanceDue.toFixed(2)}
        </h3>
      </div>

      {/* ================= TERMS ================= */}
      {showTerms && (
        <div className="mt-4 border-t pt-4 text-sm text-gray-600">
          <TermsBlock
            terms={data.terms}
            notes={data.notes}
            headingClassName="font-semibold"
            listClassName="mt-2 space-y-2 text-sm text-gray-600"
          />
        </div>
      )}
    </div>
  );
};

export default ClassicTemplate;
