"use client";

import { useState } from "react";
import InvoiceForm from "@/components/invoice/InvoiceForm";
import InvoicePreview from "@/components/invoice/InvoicePreview";
import AddInvoiceColumnModal from "@/components/invoice/AddInvoiceColumnModal";
import { CREATE_INVOICE } from "@/lib/graphql/mutations/invoice.mutations";
import { useMutation } from "@apollo/client/react";

/* ================= TYPES ================= */

export type InvoiceItem = Record<string, string | number>;

export interface InvoiceFormValues {
  client: string;
  business: string;
  currency: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  notes: string;
  discount: number;
  paid: number;
  subtotal: number;
  total: number;
  columns: InvoiceColumnInput[]
}

export type InvoiceColumnInput = {
  id?: string;
  fieldKey: string;
  label: string;
  type: "text" | "number";
  order: number;
  behavior: "ADD" | "SUBTRACT" | "NONE";
  locked?: boolean;
};

/* ================= PAGE ================= */

const Page = () => {
  const [invoiceData, setInvoiceData] =
    useState<InvoiceFormValues | null>(null);

  // mutations
  const [createInvoice, { loading }] = useMutation(CREATE_INVOICE);

  const [columns, setColumns] = useState<InvoiceColumnInput[]>([
    {
      fieldKey: "description",
      label: "Description",
      type: "text",
      behavior: "NONE",
      order: 1,
      locked: true,
    },
    {
      fieldKey: "quantity",
      label: "Qty",
      type: "number",
      behavior: "NONE",
      order: 2,
      locked: true,
    },
    {
      fieldKey: "price",
      label: "Price",
      type: "number",
      behavior: "NONE",
      order: 3,
      locked: true,
    },
  ]);

  const [addColumnModalOpen, setAddColumnModalOpen] = useState(false);



  const handleSubmit = async () => {

    console.log('invoice data is ', invoiceData)
    try {
      console.log("submitted");

      const { data } = await createInvoice({
        variables: {
          input: {
            businessId: invoiceData?.business,
            clientId: invoiceData?.client,
            clientName: "Test Name", // make sure you have this
            invoiceNumber: "1234",                  // generated invoice number
            currency: "BDT",
            issueDate: invoiceData?.issueDate,
            dueDate: invoiceData?.dueDate,
            notes: invoiceData?.notes,
            status: "DRAFT",

            columns: columns.map(({ locked, ...col }) => col),

            items: invoiceData?.items.map((item) => ({
              values: item,
            })),

            totals: {
              additions: {
                shipping: 0,
                tax: 0
              },
              grandTotal: invoiceData?.total,
              subTotal: invoiceData?.subtotal,
              subtractions: {
                discount: invoiceData?.discount
              }
            },
          },
        },
      });
    } catch (error) {
      console.error("Create invoice failed:", error);
    }
  };


  return (
    <div className="min-h-screen flex flex-col gap-8">
      <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow-lg p-6">
        <InvoiceForm
          columns={columns}
          setColumns={setColumns}
          onUpdate={setInvoiceData}
          setAddColumnModalOpen={setAddColumnModalOpen}
          handleSubmit={handleSubmit}
        />
      </div>

      <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow-lg p-6">
        {/* <InvoicePreview data={invoiceData} /> */}
      </div>

      <AddInvoiceColumnModal
        open={addColumnModalOpen}
        onClose={() => setAddColumnModalOpen(false)}
        columns={columns}
        setColumns={setColumns}
      />
    </div>
  );
};

export default Page;
