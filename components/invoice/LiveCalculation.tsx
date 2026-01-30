import { InvoiceColumnInput, InvoiceFormValues } from "@/app/(dashboard)/(invoice)/generate-invoice/page";
import { useFormikContext } from "formik";
import { useEffect } from "react";
import {
  clampNumber,
  computeColumnAmount,
  getColumnMeta,
  normalizeNumber,
} from "./columnUtils";

export const LiveCalculation = ({
  columns,
  onUpdate,
}: {
  columns: InvoiceColumnInput[];
  onUpdate: (data: InvoiceFormValues) => void;
}) => {
  const { values, setFieldValue } = useFormikContext<InvoiceFormValues>();

  useEffect(() => {
    let subtotal = 0;
    let hasItemChange = false;

    const updatedItems = values.items.map((item) => {
      const qty = normalizeNumber(item.quantity);
      const price = normalizeNumber(item.price);

      const baseAmount = qty * price;
      let itemTotal = baseAmount;

      columns.forEach((column) => {
        if (column.type !== "number") return;
        if (["quantity", "price", "total"].includes(column.fieldKey)) return;

        const meta = getColumnMeta(column);
        if (!meta.affectsTotal || column.behavior === "NONE") return;

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

        if (column.behavior === "ADD") itemTotal += amount;
        if (column.behavior === "SUBTRACT") itemTotal -= amount;
      });

      subtotal += itemTotal;

      if (item.total !== itemTotal) {
        hasItemChange = true;
        return { ...item, total: itemTotal };
      }

      return item;
    });

    const customDelta = (values.totalsCustom ?? []).reduce((acc, field) => {
      const rawValue = Number(field.value || 0);
      const amount =
        field.valueType === "PERCENT" ? (subtotal * rawValue) / 100 : rawValue;

      if (field.behavior === "ADD") return acc + amount;
      if (field.behavior === "SUBTRACT") return acc - amount;
      return acc;
    }, 0);

    const total = subtotal + customDelta;
    const paid = Number(values.paid || 0);
    const balanceDue = total - paid;

    // ✅ Update only when necessary
    if (hasItemChange) {
      setFieldValue("items", updatedItems, false);
    }

    if (values.subtotal !== subtotal) {
      setFieldValue("subtotal", subtotal, false);
    }

    if (values.total !== total) {
      setFieldValue("total", total, false);
    }
    if (values.balanceDue !== balanceDue) {
      setFieldValue("balanceDue", balanceDue, false);
    }

    // ✅ Preview sync (safe)
    onUpdate({
      ...values,
      items: hasItemChange ? updatedItems : values.items,
      subtotal,
      total,
      paid,
      balanceDue,
    });
  }, [
    values.items,
    values.totalsCustom,
    columns,
    values.subtotal,
    values.total,
    values.paid,
    values.balanceDue,
    setFieldValue,
    onUpdate,
    values
  ]);

  return null;
};
