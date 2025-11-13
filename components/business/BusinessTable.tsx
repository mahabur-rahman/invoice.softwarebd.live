"use client";

import React from "react";
import { Table, Avatar, Spin } from "antd";
import { useQuery } from "@apollo/client/react";
import { GET_MY_BUSINESSES } from "@/lib/graphql/queries";

const BusinessTable = () => {
  const { data, loading, error } = useQuery(GET_MY_BUSINESSES);

  if (loading)
    return (
      <div className="flex justify-center py-10">
        <Spin size="large" />
      </div>
    );

  if (error)
    return <div className="text-red-500">Failed to load businesses.</div>;

  const businesses = data || [];

  const columns = [
    {
      title: "Logo",
      dataIndex: "logoUrl",
      key: "logoUrl",
      render: (url: string) => <Avatar src={url} size={40} />,
    },
    {
      title: "Company Name",
      dataIndex: "companyName",
      key: "companyName",
    },
    {
      title: "Contact Email",
      dataIndex: "contactEmail",
      key: "contactEmail",
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Website",
      dataIndex: "websiteUrl",
      key: "websiteUrl",
      render: (url: string) => (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {url}
        </a>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (ts: number) => new Date(ts).toLocaleString(),
    },
  ];

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <Table
        columns={columns}
        dataSource={businesses.map((item: any) => ({
          ...item,
          key: item._id,
        }))}
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
};

export default BusinessTable;
