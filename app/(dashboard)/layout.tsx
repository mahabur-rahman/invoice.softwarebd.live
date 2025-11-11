"use client";

import React, { useState } from "react";
import Header from "@/components/layout/Header";
import { Layout as AntLayout } from "antd";
import Sidebar from "@/components/layout/Sideabar";

const { Content } = AntLayout;

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="h-screen w-full overflow-hidden flex">
      <Sidebar collapsed={collapsed} />

      <div className="flex flex-col flex-1 h-full">
        <Header collapsed={collapsed} setCollapsed={setCollapsed} />

        <div className="flex-1 overflow-hidden relative">
          <Content
            className="absolute inset-0 overflow-y-auto p-6 bg-white"
            style={{
              borderRadius: 8,
              margin: "0",
            }}
          >
            {children}
          </Content>
        </div>
      </div>
    </div>
  );
};

export default Layout;
