import Header from "@/components/Header";
import Sidebar from "@/components/Sideabar";
import React from "react";


const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <div className="sticky top-0 z-50">
                <Header />
            </div>

            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 p-6 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
};

export default Layout;
