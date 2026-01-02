"use client";

import { Modal, Button, Spin } from "antd";

interface ConfirmModalProps {
    open: boolean;
    title: string;
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmModal = ({
    open,
    title,
    loading,
    onConfirm,
    onCancel,
}: ConfirmModalProps) => {
    return (
        <Modal
            open={open}
            onCancel={onCancel}
            footer={null}
            centered
        >
            <div className="text-center p-4">
                <h2 className="text-xl font-semibold mb-4">
                    {title}
                </h2>

                <p className="text-gray-600 mb-6">
                    This action cannot be undone.
                </p>

                <div className="flex justify-center gap-4">
                    <Button onClick={onCancel}>Cancel</Button>
                    <Button disabled={loading} danger type="primary" onClick={onConfirm}>
                        {loading ? (
                            <span className="inline-flex items-center gap-2">
                                <Spin size="small" />
                                <span>Please wait...</span>
                            </span>
                        ) : (
                            "Confirm"
                        )}

                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmModal;
