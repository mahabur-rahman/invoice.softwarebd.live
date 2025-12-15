"use client";

import { Formik, Form, Field, FieldArray } from "formik";
import * as Yup from "yup";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { useQuery } from "@apollo/client/react";
import { GetMyBusinessesQuery } from "@/lib/graphql/generated-types";
import { GET_MY_BUSINESSES } from "@/lib/graphql/queries";

interface InvoiceItem {
  description: string;
  qty: number;
  price: number;
}

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
}

interface InvoiceFormProps {
  onUpdate: (data: InvoiceFormValues) => void;
}

const validationSchema = Yup.object({
  client: Yup.string().required("Client name is required"),
  clientCompany: Yup.string().required("Client company is required"),
  currency: Yup.string().required("Currency is required"),
});

const InvoiceForm = ({ onUpdate }: InvoiceFormProps) => {
  const initialValues: InvoiceFormValues = {
    client: "",
    business: "",
    currency: "USD",
    issueDate: "",
    dueDate: "",
    items: [{ description: "", qty: 1, price: 0 }],
    notes: "Thank you for your business.",
    discount: 0,
    paid: 0,
    subtotal: 0,
    total: 0,
  };

  const handleLiveUpdate = (values: InvoiceFormValues) => {
    const subtotal = values.items.reduce((sum, i) => sum + i.qty * i.price, 0);
    const total = subtotal - values.discount - values.paid;
    onUpdate({ ...values, subtotal, total });
    return {};
  };

  const { data: businessData } =
    useQuery<GetMyBusinessesQuery>(GET_MY_BUSINESSES);

  return (
    <Formik<InvoiceFormValues>
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={() => { }}
      validate={handleLiveUpdate}
    >
      {({ values }) => (
        <Form className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Create Invoice</h2>

          {/* Client Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-medium text-gray-700 text-sm">
                Select Business
              </label>

              <Field
                as="select"
                name="business"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select a business</option>

                {businessData?.myBusinesses.map((business) => (
                  <option key={business._id} value={business._id}>
                    {business.companyName}
                  </option>
                ))}
              </Field>
            </div>
            <div>
              <label className="font-medium text-gray-700 text-sm">
                Client Name
              </label>
              <Field
                name="client"
                placeholder="John Doe"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>


          </div>

          {/* Dates & Currency */}
          <div className="grid grid-cols-3 gap-4">
            <Field
              name="currency"
              placeholder="USD"
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase"
            />
            <Field
              type="date"
              name="issueDate"
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <Field
              type="date"
              name="dueDate"
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Items */}
          <FieldArray name="items">
            {({ push, remove }) => (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-800">Items</h3>
                {values.items.map((item, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-12 gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3"
                  >
                    <Field
                      name={`items.${i}.description`}
                      placeholder="Description"
                      className="col-span-6 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <Field
                      name={`items.${i}.qty`}
                      type="number"
                      placeholder="Qty"
                      className="col-span-2 p-2 border border-gray-300 rounded-md text-center focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <Field
                      name={`items.${i}.price`}
                      type="number"
                      placeholder="Price"
                      className="col-span-3 p-2 border border-gray-300 rounded-md text-center focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      className="col-span-1 text-red-500 hover:text-red-700"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    push({ description: "", qty: 1, price: 0 })
                  }
                  className="flex items-center gap-2 bg-blue-100 text-blue-600 px-3 py-2 rounded-md text-sm hover:bg-blue-200 transition"
                >
                  <FiPlus /> Add Item
                </button>
              </div>
            )}
          </FieldArray>

          {/* Notes */}
          <div>
            <label className="font-medium text-gray-700 text-sm">
              Notes / Terms
            </label>
            <Field
              as="textarea"
              name="notes"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default InvoiceForm;
