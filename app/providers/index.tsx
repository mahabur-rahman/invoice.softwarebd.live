"use client";

import { ReactNode } from "react";
import client from "@/lib/apollo-client";
import { ToastProvider } from "./ToastProvider";
import { ApolloProvider } from "@apollo/client/react";

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <ApolloProvider client={client}>
            <ToastProvider>
                {children}
            </ToastProvider>
        </ApolloProvider>
    );
}
