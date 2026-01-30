import { InvoiceColumnInput } from "@/app/(dashboard)/(invoice)/generate-invoice/page";
import { Modal, Form, Input, Select, Switch } from "antd";

const { Option } = Select;

const COLUMN_PRESETS = [
  {
    value: "discount_percent",
    label: "Discount (%)",
    preset: {
      label: "Discount (%)",
      behavior: "SUBTRACT",
      format: "PERCENT",
      role: "discount",
    },
  },
  {
    value: "discount_fixed",
    label: "Discount (Fixed)",
    preset: {
      label: "Discount",
      behavior: "SUBTRACT",
      format: "FIXED",
      role: "discount",
    },
  },
  {
    value: "tax_percent",
    label: "Tax (%)",
    preset: {
      label: "Tax (%)",
      behavior: "ADD",
      format: "PERCENT",
      role: "tax",
    },
  },
  {
    value: "tax_fixed",
    label: "Tax (Fixed)",
    preset: {
      label: "Tax",
      behavior: "ADD",
      format: "FIXED",
      role: "tax",
    },
  },
  {
    value: "fee_adjustment",
    label: "Fee / Adjustment",
    preset: {
      label: "Fee",
      behavior: "ADD",
      format: "FIXED",
      role: "fee",
    },
  },
  {
    value: "custom",
    label: "Custom (Advanced)",
    preset: null,
  },
];

type Props = {
  open: boolean;
  onClose: () => void;
  columns: InvoiceColumnInput[];
  setColumns: React.Dispatch<React.SetStateAction<InvoiceColumnInput[]>>;
};

const generateFieldKey = (label: string) =>
  label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_");

const generateUniqueFieldKey = (label: string, existing: Set<string>) => {
  const base = generateFieldKey(label) || "column";
  let candidate = base;
  let index = 2;
  while (existing.has(candidate)) {
    candidate = `${base}_${index}`;
    index += 1;
  }
  return candidate;
};

export default function AddInvoiceColumnModal({
  open,
  onClose,
  columns,
  setColumns,
}: Props) {
  const [form] = Form.useForm();
  const columnType = Form.useWatch("columnType", form);
  const affectsTotal = Form.useWatch("affectsTotal", form);
  const existingKeys = new Set(columns.map((column) => column.fieldKey));

  return (
    <Modal
      title="Add Invoice Column"
      open={open}
      onCancel={() => {
        onClose();
        form.resetFields();
      }}
      onOk={() => form.submit()}
      okText="Add Column"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          columnType: "discount_percent",
          behavior: "SUBTRACT",
          format: "PERCENT",
          role: "discount",
          affectsTotal: true,
          type: "number",
          label: "Discount (%)",
          fieldKey: generateUniqueFieldKey("Discount (%)", existingKeys),
        }}
        onValuesChange={(changedValues) => {
          if (changedValues.columnType) {
            const match = COLUMN_PRESETS.find(
              (preset) => preset.value === changedValues.columnType
            );
            if (match?.preset) {
              form.setFieldsValue({
                label: match.preset.label,
                behavior: match.preset.behavior,
                format: match.preset.format,
                role: match.preset.role,
                affectsTotal: true,
                type: "number",
                fieldKey: generateUniqueFieldKey(
                  match.preset.label,
                  existingKeys
                ),
              });
            } else {
              form.setFieldsValue({
                label: "",
                fieldKey: "",
                role: "custom",
                format: "FIXED",
                affectsTotal: true,
                behavior: "ADD",
                type: "number",
              });
            }
          }
          if (changedValues.label) {
            form.setFieldsValue({
              fieldKey: generateUniqueFieldKey(changedValues.label, existingKeys),
            });
          }
          if (changedValues.affectsTotal === false) {
            form.setFieldsValue({ behavior: "NONE" });
          }
          if (changedValues.format) {
            form.setFieldsValue({ type: "number" });
          }
        }}
        onFinish={(values) => {
          const shouldAffectTotal = values.affectsTotal !== false;
          const behavior = shouldAffectTotal
            ? values.behavior ?? "ADD"
            : "NONE";
          const format = values.format ?? "FIXED";
          const role = values.role ?? "custom";

          setColumns((prev) => {
            const keys = new Set(prev.map((col) => col.fieldKey));
            const fieldKey = generateUniqueFieldKey(values.label, keys);
            const nextColumn = {
              ...values,
              fieldKey,
              type: "number",
              behavior,
              format,
              role,
              affectsTotal: shouldAffectTotal,
              order: prev.length + 1,
              hidden: false,
            } as InvoiceColumnInput;

            const totalIndex = prev.findIndex(
              (column) => column.fieldKey === "total"
            );
            const next = [...prev];
            if (totalIndex >= 0) {
              next.splice(totalIndex, 0, nextColumn);
            } else {
              next.push(nextColumn);
            }

            return next.map((column, index) => ({
              ...column,
              order: index + 1,
            }));
          });

          onClose();
          form.resetFields();
        }}
      >
        {/* Hidden auto-generated fieldKey */}
        <Form.Item name="fieldKey" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="role" hidden>
          <Input />
        </Form.Item>

        <Form.Item
          label="Column Type (Recommended presets)"
          name="columnType"
          rules={[{ required: true }]}
        >
          <Select>
            {COLUMN_PRESETS.map((preset) => (
              <Option key={preset.value} value={preset.value}>
                {preset.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Label"
          name="label"
          rules={[{ required: true, message: "Label is required" }]}
        >
          <Input placeholder="e.g. Delivery Charge" />
        </Form.Item>

        <Form.Item label="Input Format" name="format" hidden={columnType !== "custom"}>
          <Select>
            <Option value="FIXED">Fixed</Option>
            <Option value="PERCENT">Percent</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Behavior"
          name="behavior"
          rules={[{ required: true }]}
          hidden={columnType !== "custom"}
        >
          <Select disabled={affectsTotal === false}>
            <Option value="ADD">ADD</Option>
            <Option value="SUBTRACT">SUBTRACT</Option>
            <Option value="NONE">NONE</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Affects total"
          name="affectsTotal"
          valuePropName="checked"
          hidden={columnType !== "custom"}
        >
          <Switch defaultChecked />
        </Form.Item>
      </Form>
    </Modal>
  );
}
