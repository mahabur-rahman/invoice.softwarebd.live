import { InvoiceColumnInput, InvoiceFormValues } from "@/app/(dashboard)/(invoice)/generate-invoice/page";
import { useFormikContext } from "formik";
import { useEffect } from "react";

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
      const qty = Number(item.quantity || 0);
      const price = Number(item.price || 0);

      let itemTotal = qty * price;

      columns.forEach((column) => {
        if (column.type !== "number") return;
        if (["quantity", "price", "total"].includes(column.fieldKey)) return;

        const value = Number(item[column.fieldKey] || 0);

        if (column.behavior === "ADD") itemTotal += value;
        if (column.behavior === "SUBTRACT") itemTotal -= value;
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

    // ✅ Preview sync (safe)
    onUpdate({
      ...values,
      items: hasItemChange ? updatedItems : values.items,
      subtotal,
      total,
    });
  }, [
    values.items,
    values.totalsCustom,
    columns,
    values.subtotal,
    values.total,
    setFieldValue,
    onUpdate,
    values
  ]);

  return null;
};
