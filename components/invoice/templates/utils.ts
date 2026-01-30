import { InvoiceColumnInput } from "@/app/(dashboard)/(invoice)/generate-invoice/page";
import { InvoiceData } from "./types";
import {
  clampNumber,
  computeColumnAmount,
  getColumnMeta,
  normalizeNumber,
} from "../columnUtils";

export const getCustomTotals = (data: InvoiceData) => {
  const custom = data.totalsCustom ?? [];
  return custom
    .filter((field) => field.behavior !== "NONE")
    .map((field) => {
      const rawValue = Number(field.value || 0);
      const amount =
        field.valueType === "PERCENT"
          ? (data.subtotal * rawValue) / 100
          : rawValue;

      return {
        key: field.key,
        label: field.label || "Custom",
        behavior: field.behavior,
        amount,
      };
    });
};

export const getRoleTotals = (
  data: InvoiceData,
  columns: InvoiceColumnInput[]
) => {
  let discountTotal = 0;
  let taxTotal = 0;
  let hasDiscount = false;
  let hasTax = false;

  data.items.forEach((item) => {
    const qty = normalizeNumber(item.quantity);
    const price = normalizeNumber(item.price);
    const baseAmount = qty * price;

    columns.forEach((column) => {
      if (column.type !== "number") return;
      if (["quantity", "price", "total"].includes(column.fieldKey)) return;

      const meta = getColumnMeta(column);
      if (!meta.affectsTotal || column.behavior === "NONE") return;

      if (meta.role === "discount") hasDiscount = true;
      if (meta.role === "tax") hasTax = true;

      if (meta.role !== "discount" && meta.role !== "tax") return;

      const rawValue = normalizeNumber(item[column.fieldKey]);
      const value =
        meta.format === "PERCENT"
          ? clampNumber(rawValue, 0, 100)
          : clampNumber(rawValue, 0);
      const amount = computeColumnAmount({
        base: baseAmount,
        value,
        format: meta.format,
      });

      if (meta.role === "discount") discountTotal += amount;
      if (meta.role === "tax") taxTotal += amount;
    });
  });

  return {
    discountTotal,
    taxTotal,
    hasDiscount,
    hasTax,
  };
};
