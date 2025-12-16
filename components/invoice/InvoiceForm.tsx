"use client";

import { Formik, Form, Field, FieldArray } from "formik";
import * as Yup from "yup";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { useQuery } from "@apollo/client/react";
import { GET_MY_BUSINESSES } from "@/lib/graphql/queries";
import { GET_ALL_CLIENTS } from "@/lib/graphql/queries/invoice.queries";
import {
  InvoiceColumnInput,
  InvoiceFormValues,
  InvoiceItem,
} from "@/app/(dashboard)/generate-invoice/page";
import { ClientType, GetMyBusinessesQuery } from "@/lib/graphql/generated-types";

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
  handleSubmit,
}: InvoiceFormProps) => {
  /* ================= HELPERS ================= */

  const createEmptyItem = (): InvoiceItem =>
    columns.reduce((acc, col) => {
      acc[col.fieldKey] = col.type === "number" ? 0 : "";
      return acc;
    }, {} as InvoiceItem);

  /* ================= INITIAL VALUES ================= */

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
  };

  /* ================= LIVE CALCULATION ================= */

  const handleLiveUpdate = (values: InvoiceFormValues) => {
    let subtotal = 0;

    values.items.forEach((item) => {
      // 1️⃣ Base calculation: Qty × Price
      const qty = Number(item.quantity || 0);
      const price = Number(item.price || 0);

      let itemTotal = qty * price;

      // 2️⃣ Apply custom columns on top of base
      columns.forEach((column) => {
        // only numeric custom columns
        if (column.type !== "number") return;

        // skip base + total columns
        if (
          column.fieldKey === "quantity" ||
          column.fieldKey === "price" ||
          column.fieldKey === "total"
        ) {
          return;
        }

        const value = Number(item[column.fieldKey] || 0);

        if (column.behavior === "ADD") {
          itemTotal += value;
        }

        if (column.behavior === "SUBTRACT") {
          itemTotal -= value;
        }
      });

      // 3️⃣ UI-only total
      item.total = itemTotal;

      subtotal += itemTotal;
    });

    // 4️⃣ Invoice-level total
    const total =
      subtotal - Number(values.discount || 0) - Number(values.paid || 0);

    onUpdate({
      ...values,
      subtotal,
      total,
    });

    return {};
  };



  /* ================= QUERIES ================= */

  const { data: businessData } = useQuery<GetMyBusinessesQuery>(GET_MY_BUSINESSES);
  const { data: clientData } = useQuery<{ findAllClients: ClientType[] }>(GET_ALL_CLIENTS);

  /* ================= RENDER ================= */

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      validate={handleLiveUpdate}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ values, setFieldValue }) => (
        <Form className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-800">
            Create Invoice
          </h2>

          {/* ================= BUSINESS / CLIENT ================= */}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Select Business
              </label>
              <Field
                as="select"
                name="business"
                className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="">Select business</option>
                {businessData?.myBusinesses?.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.companyName}
                  </option>
                ))}
              </Field>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Select Client
              </label>
              <Field
                as="select"
                name="client"
                className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="">Select client</option>
                {clientData?.findAllClients?.map((c) => (
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
              <label className="text-sm font-medium text-gray-700">
                Issue Date
              </label>
              <Field
                type="date"
                name="issueDate"
                className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Due Date
              </label>
              <Field
                type="date"
                name="dueDate"
                className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Currency
              </label>
              <Field
                as="select"
                name="currency"
                className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="BDT">BDT</option>
              </Field>
            </div>
          </div>

          {/* ================= ITEMS ================= */}

          <FieldArray name="items">
            {({ push, remove }) => (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800">Items</h3>
                  <button
                    type="button"
                    onClick={() => setAddColumnModalOpen(true)}
                    className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm border border-gray-300"
                  >
                    <FiPlus /> Add Column
                  </button>
                </div>

                {values.items.map((_, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-12 gap-3 bg-white border border-gray-200 rounded-lg p-3"
                  >
                    {columns.map((column) => {
                      const isDescription =
                        column.fieldKey === "description";
                      const isTotal = column.fieldKey === "total";

                      return (
                        <div
                          key={column.fieldKey}
                          className={`flex flex-col gap-1 ${isDescription ? "col-span-6" : "col-span-2"
                            }`}
                        >
                          <div className="flex justify-between">
                            <label className="text-sm font-medium text-gray-700">
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
                            readOnly={isTotal}
                            type={
                              column.type === "number"
                                ? "number"
                                : "text"
                            }
                            className={`p-2 border rounded-md ${isTotal
                              ? "bg-gray-100 text-center font-semibold"
                              : "bg-white"
                              } border-gray-300`}
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
                  className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm border border-gray-300"
                >
                  <FiPlus /> Add Item
                </button>
              </div>
            )}
          </FieldArray>

          {/* ================= NOTES ================= */}

          <div>
            <label className="text-sm font-medium text-gray-700">
              Notes / Terms
            </label>
            <Field
              as="textarea"
              name="notes"
              rows={3}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white"
            />
          </div>

          {/* ================= SUBMIT ================= */}

          <button
            type="submit"
            className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition"
          >
            Create Invoice
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default InvoiceForm;
