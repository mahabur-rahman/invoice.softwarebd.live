"use client";

import { createContext, useContext } from "react";
import { message } from "antd";

interface ToastMethods {
    success: (msg: string) => void;
    error: (msg: string) => void;
    info: (msg: string) => void;
    warning: (msg: string) => void;
    loading: (msg: string) => void;
}


const ToastContext = createContext<ToastMethods | null>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [messageApi, contextHolder] = message.useMessage();

    const toast = {
        success: (msg: string) => messageApi.success(msg),
        error: (msg: string) => messageApi.error(msg),
        info: (msg: string) => messageApi.info(msg),
        warning: (msg: string) => messageApi.warning(msg),
        loading: (msg: string) => messageApi.loading(msg),
    };

    return (
        <ToastContext.Provider value={toast}>
            {contextHolder}
            {children}
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
