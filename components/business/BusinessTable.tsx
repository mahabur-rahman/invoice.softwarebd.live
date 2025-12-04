"use client";

import React, { useState } from "react";
import { Table, Avatar, Spin, Button, Modal } from "antd";
import { FiEdit, FiTrash, FiPlus } from "react-icons/fi";
import { GET_MY_BUSINESSES } from "@/lib/graphql/queries";
import { GetMyBusinessesQuery } from "@/lib/graphql/generated-types";
import { DELETE_BUSINESS } from "@/lib/graphql/mutations";
import { useQuery, useMutation } from "@apollo/client/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type BusinessRow = GetMyBusinessesQuery["myBusinesses"][0];

const BusinessTable = () => {
  const router = useRouter()
  const { data, loading, error } =
    useQuery<GetMyBusinessesQuery>(GET_MY_BUSINESSES);

  const [deleteBusiness] = useMutation(DELETE_BUSINESS, {
    refetchQueries: [{ query: GET_MY_BUSINESSES }],
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const openDeleteModal = (id: string) => {
    setSelectedId(id);
    setModalVisible(true);
  };

  const confirmDelete = async () => {
    if (selectedId) {
      await deleteBusiness({ variables: { id: selectedId } });
      setModalVisible(false);
      setSelectedId(null);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-10">
        <Spin size="large" />
      </div>
    );

  if (error)
    return <div className="text-red-500">Failed to load businesses.</div>;

  const businesses = data?.myBusinesses ?? [];

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
      render: (ts: number) => {
        const date = new Date(ts);
        return date.toISOString().replace('T', ' ').substring(0, 19);
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: BusinessRow) => (
        <div className="flex gap-3 text-lg">
          <FiEdit
            className="cursor-pointer text-blue-600 hover:text-blue-800"
            onClick={() => router.push(`my-business/edit/${record._id}`)}
          />
          <FiTrash
            className="cursor-pointer text-red-500 hover:text-red-700"
            onClick={() => openDeleteModal(record._id)}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <Modal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        centered
      >
        <div className="text-center p-4">
          <h2 className="text-xl font-semibold mb-2">
            Delete Business?
          </h2>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this business?
            <br /> This action cannot be undone.
          </p>

          <div className="flex justify-center gap-4">
            <Button onClick={() => setModalVisible(false)}>Cancel</Button>
            <Button danger type="primary" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Table Wrapper */}
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Businesses</h2>
          <Link href='/my-business/add-new'>
            <Button
              type="primary"
              icon={<FiPlus />}
              className="flex items-center gap-2"
            >
              Add Business
            </Button>
          </Link>
        </div>

        <Table<BusinessRow>
          columns={columns}
          dataSource={businesses.map((item) => ({
            ...item,
            key: item._id,
          }))}
          pagination={{ pageSize: 5 }}
        />
      </div>
    </>
  );
};

export default BusinessTable;
