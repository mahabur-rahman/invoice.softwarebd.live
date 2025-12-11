"use client";

import React, { useState } from "react";
import { Table, Spin, Button, Modal } from "antd";
import { FiEdit, FiTrash, FiPlus } from "react-icons/fi";
import { useQuery, useMutation } from "@apollo/client/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { GET_ALL_CLIENTS } from "@/lib/graphql/queries/invoice.queries";
import { DELETE_CLIENT } from "@/lib/graphql/mutations/invoice.mutations";
import { ClientType } from "@/lib/graphql/generated-types";

type ClientRow = ClientType;

const ClientTable = () => {
  const router = useRouter();

  // Correct query shape: { findAllClients: ClientType[] }
  const { data, loading, error } =
    useQuery<{ findAllClients: ClientType[] }>(GET_ALL_CLIENTS);

  const [deleteClient] = useMutation(DELETE_CLIENT, {
    refetchQueries: [{ query: GET_ALL_CLIENTS }],
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const openDeleteModal = (id: string) => {
    setSelectedId(id);
    setModalVisible(true);
  };

  const confirmDelete = async () => {
    if (selectedId) {
      await deleteClient({ variables: { id: selectedId } });
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
    return <div className="text-red-500">Failed to load clients.</div>;

  const clients = data?.findAllClients ?? [];

  const columns = [
    {
      title: "Client Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Company",
      dataIndex: "clientCompanyName",
      key: "clientCompanyName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Business",
      dataIndex: "business",
      key: "business",
      render: (business: ClientRow["business"]) =>
        business?.companyName ?? "N/A",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (ts: number) => {
        const date = new Date(ts);
        return date.toISOString().replace("T", " ").substring(0, 19);
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: ClientRow) => (
        <div className="flex gap-3 text-lg">
          <FiEdit
            className="cursor-pointer text-blue-600 hover:text-blue-800"
            onClick={() => router.push(`/clients/edit/${record._id}`)}
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
      {/* DELETE MODAL */}
      <Modal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        centered
      >
        <div className="text-center p-4">
          <h2 className="text-xl font-semibold mb-2">Delete Client?</h2>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this client?
            <br />
            This action cannot be undone.
          </p>

          <div className="flex justify-center gap-4">
            <Button onClick={() => setModalVisible(false)}>Cancel</Button>
            <Button danger type="primary" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* TABLE */}
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Clients</h2>
          <Link href="/clients/add-new">
            <Button
              type="primary"
              icon={<FiPlus />}
              className="flex items-center gap-2"
            >
              Add Client
            </Button>
          </Link>
        </div>

        <Table<ClientRow>
          columns={columns}
          dataSource={clients.map((item) => ({
            ...item,
            key: item._id,
          }))}
          pagination={{ pageSize: 5 }}
        />
      </div>
    </>
  );
};

export default ClientTable;
