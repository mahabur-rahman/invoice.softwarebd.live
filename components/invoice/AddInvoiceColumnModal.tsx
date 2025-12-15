import { InvoiceColumnInput } from "@/app/(dashboard)/generate-invoice/page";
import { Modal, Form, Input, Select } from "antd";

const { Option } = Select;

type Props = {
    open: boolean;
    onClose: () => void;
    columns: InvoiceColumnInput[];
    setColumns: React.Dispatch<React.SetStateAction<InvoiceColumnInput[]>>;
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
                onFinish={(values) => {
                    setColumns((prev) => [
                        ...prev,
                        {
                            ...values,
                            order: prev.length + 1,
                        },
                    ]);

                    onClose();
                    form.resetFields();
                }}
            >        <Form.Item
                label="Field Key"
                name="fieldKey"
                rules={[{ required: true, message: "Field key is required" }]}
            >
                    <Input placeholder="e.g. tax" />
                </Form.Item>

                <Form.Item
                    label="Label"
                    name="label"
                    rules={[{ required: true, message: "Label is required" }]}
                >
                    <Input placeholder="e.g. Tax Amount" />
                </Form.Item>

                <Form.Item
                    label="Type"
                    name="type"
                    rules={[{ required: true }]}
                >
                    <Select placeholder="Select type">
                        <Option value="number">Number</Option>
                        <Option value="text">Text</Option>
                    </Select>
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
