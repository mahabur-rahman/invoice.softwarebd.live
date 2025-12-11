"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";


import { BusinessType, ClientType } from "@/lib/graphql/generated-types";
import { Spin, Button, Input } from "antd";
import { CREATE_CLIENT, UPDATE_CLIENT } from "@/lib/graphql/mutations/invoice.mutations";
import { FIND_ONE_CLIENT, GET_MY_BUSINESSES_ID } from "@/lib/graphql/queries/invoice.queries";
import { useQuery, useMutation } from "@apollo/client/react";
import { useUserStore } from "@/lib/store/userStore";
import { BusinessQueryResponse } from "@/lib/interfaces/responseTypes";

// ------------ VALIDATION SCHEMA ------------
const ClientSchema = Yup.object().shape({
    name: Yup.string().required("Client name is required"),
    clientCompanyName: Yup.string().required("Company name is required"),
    address: Yup.string().required("Address is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string().required("Phone number is required"),
    businessId: Yup.string().required("Business ID is required"),
});

type ClientFormValues = {
    id?: string;
    name: string;
    clientCompanyName: string;
    address: string;
    email: string;
    phone: string;
    businessId: string;
    userId: string;
};


const AddNewClient = () => {
    const router = useRouter();
    const params = useSearchParams();
    const userId = useUserStore((state) => state.userId);

    const clientId = params.get("id");

    const { data, loading } = useQuery<{ findOneClient: ClientType }>(
        FIND_ONE_CLIENT,
        {
            variables: { id: clientId },
            skip: !clientId,
        }
    );

    const { data: businessList, loading: bizLoading } =
        useQuery<BusinessQueryResponse>(GET_MY_BUSINESSES_ID);  

    const [createClient] = useMutation(CREATE_CLIENT);
    const [updateClient] = useMutation(UPDATE_CLIENT);

    if (loading)
        return (
            <div className="flex justify-center py-10">
                <Spin size="large" />
            </div>
        );

    // Default values (add mode)
    const initialValues: ClientFormValues = clientId
        ? {
            id: data?.findOneClient?._id || "",
            name: data?.findOneClient?.name || "",
            clientCompanyName: data?.findOneClient?.clientCompanyName || "",
            address: data?.findOneClient?.address || "",
            email: data?.findOneClient?.email || "",
            phone: data?.findOneClient?.phone || "",
            businessId: data?.findOneClient?.businessId || "",
            userId: data?.findOneClient?.userId || "",
        }
        : {
            name: "",
            clientCompanyName: "",
            address: "",
            email: "",
            phone: "",
            businessId: "",
            userId: userId || "",
        };


    const handleSubmit = async (values: any) => {
        try {
            if (clientId) {
                await updateClient({
                    variables: {
                        input: {
                            id: clientId,
                            ...values,
                        },
                    },
                });
            } else {
                await createClient({
                    variables: { input: values },
                });
            }

            router.push("/clients");
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="w-full bg-white shadow-lg border border-gray-100 rounded-xl p-8">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        {clientId ? "Edit Client" : "Add New Client"}
      </h2>

      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={ClientSchema}
        onSubmit={handleSubmit}
      >
        {({ values, handleChange, setFieldValue, errors, touched, isSubmitting }) => (
          <Form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Client Name */}
              <div className="flex flex-col gap-1">
                <label className="font-medium">Client Name</label>
                <Input
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  placeholder="Enter client name"
                />
                {errors.name && touched.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>

              {/* Company Name */}
              <div className="flex flex-col gap-1">
                <label className="font-medium">Company Name</label>
                <Input
                  name="clientCompanyName"
                  value={values.clientCompanyName}
                  onChange={handleChange}
                  placeholder="Enter company name"
                />
                {errors.clientCompanyName && touched.clientCompanyName && (
                  <p className="text-red-500 text-sm">{errors.clientCompanyName}</p>
                )}
              </div>

              {/* Address */}
              <div className="flex flex-col gap-1">
                <label className="font-medium">Address</label>
                <Input
                  name="address"
                  value={values.address}
                  onChange={handleChange}
                  placeholder="Enter client address"
                />
                {errors.address && touched.address && <p className="text-red-500 text-sm">{errors.address}</p>}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1">
                <label className="font-medium">Email</label>
                <Input
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  placeholder="Enter client email"
                />
                {errors.email && touched.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1">
                <label className="font-medium">Phone</label>
                <Input
                  name="phone"
                  value={values.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
                {errors.phone && touched.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
              </div>

              {/* Business dropdown */}
              <div className="flex flex-col gap-1">
                <label className="font-medium">Business</label>

                {bizLoading ? (
                  <div className="h-10 bg-gray-100 animate-pulse rounded-md" />
                ) : (
                  <select
                    name="businessId"
                    value={values.businessId}
                    onChange={handleChange}
                    className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a business</option>
                    {businessList?.myBusinesses.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.companyName}
                      </option>
                    ))}
                  </select>
                )}

                {errors.businessId && touched.businessId && (
                  <p className="text-red-500 text-sm">{errors.businessId}</p>
                )}
              </div>

            </div>

            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              className="mt-8 w-full h-11 text-lg rounded-lg"
            >
              {clientId ? "Update Client" : "Create Client"}
            </Button>
          </Form>
        )}
      </Formik>
    </div>

    );
};

export default AddNewClient;
