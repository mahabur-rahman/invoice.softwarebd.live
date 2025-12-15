"use client";

import { Formik, Form, Field, FieldArray } from "formik";
import * as Yup from "yup";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { useQuery } from "@apollo/client/react";
import { ClientType, GetMyBusinessesQuery } from "@/lib/graphql/generated-types";
import { GET_MY_BUSINESSES } from "@/lib/graphql/queries";
import { GET_ALL_CLIENTS } from "@/lib/graphql/queries/invoice.queries";
import {
  InvoiceColumnInput,
  InvoiceFormValues,
  InvoiceItem,
} from "@/app/(dashboard)/generate-invoice/page";

/* ================= PROPS ================= */

interface InvoiceFormProps {
  onUpdate: (data: InvoiceFormValues) => void;
  setAddColumnModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  columns: InvoiceColumnInput[];
  setColumns: React.Dispatch<React.SetStateAction<InvoiceColumnInput[]>>;
  handleSubmit: () => void;
}

/* ================= VALIDATION ================= */

const validationSchema = Yup.object({
  client: Yup.string().required("Client is required"),
  business: Yup.string().required("Business is required"),
  currency: Yup.string().required("Currency is required"),
});

/* ================= COMPONENT ================= */

const InvoiceForm = ({
  onUpdate,
  setAddColumnModalOpen,
  columns,
  setColumns,
  handleSubmit
}: InvoiceFormProps) => {
  /* ---------- helpers ---------- */

  const createEmptyItem = (): InvoiceItem =>
    columns.reduce((acc, col) => {
      acc[col.fieldKey] = col.type === "number" ? 0 : "";
      return acc;
    }, {} as InvoiceItem);

  const initialValues: InvoiceFormValues = {
    client: "",
    business: "",
    currency: "BDT",
    issueDate: "",
    dueDate: "",
    items: [createEmptyItem()],
    notes: "Thank you for your business.",
    discount: 0,
    paid: 0,
    subtotal: 0,
    total: 0,
    columns: columns
  };

  const handleLiveUpdate = (values: InvoiceFormValues) => {
    const subtotal = values.items.reduce((sum, item) => {
      const qty = Number(item.qty || 0);
      const price = Number(item.price || 0);
      return sum + qty * price;
    }, 0);

    const total =
      subtotal - Number(values.discount) - Number(values.paid);

    onUpdate({ ...values, subtotal, total });
    return {};
  };

  /* ---------- queries ---------- */

  const { data: businessData } =
    useQuery<GetMyBusinessesQuery>(GET_MY_BUSINESSES);

  const { data: clientData } =
    useQuery<{ findAllClients: ClientType[] }>(GET_ALL_CLIENTS);

  /* ---------- render ---------- */

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      validate={handleLiveUpdate}
      onSubmit={() => { handleSubmit() }}
    >
      {({ values, setFieldValue }) => (
        <Form className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-800">
            Create Invoice
          </h2>

          {/* ================= CLIENT / BUSINESS ================= */}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select Business
              </label>
              <Field
                as="select"
                name="business"
                className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a business</option>
                {businessData?.myBusinesses.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.companyName}
                  </option>
                ))}
              </Field>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select Client
              </label>
              <Field
                as="select"
                name="client"
                className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a client</option>
                {clientData?.findAllClients.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </Field>
            </div>
          </div>

          {/* ================= DATES & CURRENCY ================= */}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Issue Date
              </label>
              <Field
                type="date"
                name="issueDate"
                className="w-full mt-1 p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Due Date
              </label>
              <Field
                type="date"
                name="dueDate"
                className="w-full mt-1 p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Currency
              </label>
              <Field
                as="select"
                name="currency"
                className="w-full mt-1 p-2 border rounded-lg"
              >
                <option value="BDT">BDT</option>
              </Field>
            </div>
          </div>

          {/* ================= ITEMS ================= */}

          <FieldArray name="items">
            {({ push, remove }) => (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800">Items</h3>
                  <button
                    type="button"
                    onClick={() => setAddColumnModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-100 text-blue-600 px-3 py-2 rounded-md text-sm"
                  >
                    <FiPlus /> Add Column
                  </button>
                </div>

                {values.items.map((_, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-12 gap-3 bg-gray-50 border rounded-lg p-3"
                  >
                    {columns.map((column) => {
                      const isDescription =
                        column.fieldKey === "description";

                      return (
                        <div
                          key={column.fieldKey}
                          className={`flex flex-col gap-1 ${isDescription ? "col-span-6" : "col-span-2"
                            }`}
                        >
                          <div className="flex justify-between">
                            <label className="text-sm font-medium">
                              {column.label}
                            </label>

                            {!column.locked && (
                              <button
                                type="button"
                                onClick={() => {
                                  setColumns((prev) =>
                                    prev.filter(
                                      (c) =>
                                        c.fieldKey !== column.fieldKey
                                    )
                                  );

                                  setFieldValue(
                                    "items",
                                    values.items.map((item) => {
                                      const {
                                        [column.fieldKey]: _,
                                        ...rest
                                      } = item;
                                      return rest;
                                    })
                                  );
                                }}
                                className="text-red-500 text-xs"
                              >
                                ✕
                              </button>
                            )}
                          </div>

                          <Field
                            name={`items.${i}.${column.fieldKey}`}
                            type={
                              column.type === "number"
                                ? "number"
                                : "text"
                            }
                            className={`p-2 border rounded-md ${column.type === "number"
                              ? "text-center"
                              : "text-left"
                              }`}
                          />
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => remove(i)}
                      className="col-span-1 flex items-center justify-center text-red-500"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => push(createEmptyItem())}
                  className="flex items-center gap-2 bg-blue-100 text-blue-600 px-3 py-2 rounded-md text-sm"
                >
                  <FiPlus /> Add Item
                </button>
              </div>
            )}
          </FieldArray>

          {/* ================= NOTES ================= */}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notes / Terms
            </label>
            <Field
              as="textarea"
              name="notes"
              rows={3}
              className="w-full mt-1 p-2 border rounded-lg"
            />
          </div>

          <button
            type="submit"
            className="flex cursor-pointer items-center gap-2 bg-blue-100 text-blue-600 px-3 py-2 rounded-md text-sm"
          >
            Create Invoice
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default InvoiceForm;
