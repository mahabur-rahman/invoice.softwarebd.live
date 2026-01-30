import { InvoiceColumnInput } from "@/app/(dashboard)/(invoice)/generate-invoice/page";

export type ColumnFormat = "PERCENT" | "FIXED" | "TEXT";
export type ColumnRole = "discount" | "tax" | "fee" | "custom" | "base";

const normalize = (value: string) => value.toLowerCase();

const detectRole = (label: string) => {
  const text = normalize(label);
  if (text.includes("discount")) return "discount" as const;
  if (text.includes("tax") || text.includes("vat") || text.includes("gst")) {
    return "tax" as const;
  }
  if (
    text.includes("fee") ||
    text.includes("charge") ||
    text.includes("shipping") ||
    text.includes("adjust")
  ) {
    return "fee" as const;
  }
  return "custom" as const;
};

const detectFormat = (label: string, type?: string) => {
  const text = normalize(label);
  if (text.includes("%") || text.includes("percent")) return "PERCENT" as const;
  if (type === "number") return "FIXED" as const;
  return "TEXT" as const;
};

export const getColumnMeta = (column: InvoiceColumnInput) => {
  const fieldKey = column.fieldKey.toLowerCase();
  const isBase = ["description", "quantity", "price", "total"].includes(fieldKey);
  const label = column.label ?? "";
  const role =
    column.role ?? (isBase ? "base" : detectRole(`${label} ${fieldKey}`));
  const format = column.format ?? detectFormat(label, column.type);
  const affectsTotal =
    typeof column.affectsTotal === "boolean"
      ? column.affectsTotal
      : column.behavior !== "NONE";

  return { role, format, affectsTotal };
};

export const normalizeNumber = (value: unknown) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const clampNumber = (value: number, min = 0, max?: number) => {
  const clamped = Math.max(min, value);
  if (typeof max === "number") return Math.min(clamped, max);
  return clamped;
};

export const computeColumnAmount = (params: {
  base: number;
  value: number;
  format: ColumnFormat;
}) => {
  if (params.format === "PERCENT") {
    return (params.base * params.value) / 100;
  }
  return params.value;
};
