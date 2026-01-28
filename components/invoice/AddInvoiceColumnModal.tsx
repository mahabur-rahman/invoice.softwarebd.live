import { InvoiceColumnInput } from "@/app/(dashboard)/(invoice)/generate-invoice/page";
import { Modal, Form, Input, Select } from "antd";

const { Option } = Select;

type Props = {
  open: boolean;
  onClose: () => void;
  columns: InvoiceColumnInput[];
  setColumns: React.Dispatch<React.SetStateAction<InvoiceColumnInput[]>>;
};

const generateFieldKey = (label: string) => {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_");
};

export default function AddInvoiceColumnModal({
  open,
  onClose,
  setColumns,
}: Props) {
  const [form] = Form.useForm();

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
        onValuesChange={(changedValues) => {
          if (changedValues.label) {
            form.setFieldsValue({
              fieldKey: generateFieldKey(changedValues.label),
            });
          }
          if (changedValues.behavior) {
            const type =
              changedValues.behavior === "ADD" || changedValues.behavior === "SUBTRACT"
                ? "number"
                : "text";
            form.setFieldsValue({ type });
          }
        }}
        onFinish={(values) => {
          setColumns((prev) => [
            ...prev,
            {
              ...values,
              fieldKey: generateFieldKey(values.label),
              type:
                values.behavior === "ADD" || values.behavior === "SUBTRACT"
                  ? "number"
                  : "text",
              order: prev.length + 1,
              hidden: false,
            },
          ]);

          onClose();
          form.resetFields();
        }}
      >
        {/* Hidden auto-generated fieldKey */}
        <Form.Item name="fieldKey" hidden>
          <Input />
        </Form.Item>

        <Form.Item
          label="Label"
          name="label"
          rules={[{ required: true, message: "Label is required" }]}
        >
          <Input placeholder="e.g. Delivery Charge" />
        </Form.Item>

        <Form.Item
          label="Behavior"
          name="behavior"
          initialValue="NONE"
          rules={[{ required: true }]}
        >
          <Select>
            <Option value="ADD">ADD</Option>
            <Option value="SUBTRACT">SUBTRACT</Option>
            <Option value="NONE">NONE</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}
