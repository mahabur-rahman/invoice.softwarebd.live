"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";


import { BusinessType, ClientType } from "@/lib/graphql/generated-types";
import { Spin, Button } from "antd";
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

        console.log("Business List:", businessList);

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
        <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
            <h2 className="text-xl font-semibold mb-4">
                {clientId ? "Edit Client" : "Add New Client"}
            </h2>

            <Formik
                enableReinitialize
                initialValues={initialValues}
                validationSchema={ClientSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting }) => (
                    <Form className="space-y-4">
                        {/* Name */}
                        <div>
                            <label>Client Name</label>
                            <Field name="name" className="input" />
                            <ErrorMessage name="name" component="div" className="text-red-500" />
                        </div>

                        {/* Company */}
                        <div>
                            <label>Company Name</label>
                            <Field name="clientCompanyName" className="input" />
                            <ErrorMessage name="clientCompanyName" component="div" className="text-red-500" />
                        </div>

                        {/* Address */}
                        <div>
                            <label>Address</label>
                            <Field name="address" className="input" />
                            <ErrorMessage name="address" component="div" className="text-red-500" />
                        </div>

                        {/* Email */}
                        <div>
                            <label>Email</label>
                            <Field name="email" type="email" className="input" />
                            <ErrorMessage name="email" component="div" className="text-red-500" />
                        </div>

                        {/* Phone */}
                        <div>
                            <label>Phone</label>
                            <Field name="phone" className="input" />
                            <ErrorMessage name="phone" component="div" className="text-red-500" />
                        </div>

                        {/* Business ID */}
                        <div>
                            <label>Business</label>

                            {bizLoading ? (
                                <p>Loading businesses...</p>
                            ) : (
                                <Field
                                    as="select"
                                    name="businessId"
                                    className="input"
                                >
                                    <option value="">Select a business</option>

                                    {businessList?.myBusinesses.map((b: BusinessType) => (
                                        <option key={b._id} value={b._id}>
                                            {b.companyName}
                                        </option>
                                    ))}
                                </Field>
                            )}

                            <ErrorMessage
                                name="businessId"
                                component="div"
                                className="text-red-500"
                            />
                        </div>


                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={isSubmitting}
                            className="w-full"
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
