import { InvoiceData } from "./types";

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
