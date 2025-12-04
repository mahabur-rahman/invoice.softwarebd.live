"use client";

import React, { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Input, Button, Upload, message } from "antd";
import { uploadLogo } from "@/utils/uploadLogo";
import Image from "next/image";
import { FiTrash, FiUpload } from "react-icons/fi";
import { useMutation } from "@apollo/client/react";
import { CREATE_BUSINESS_MUTATION, UPDATE_BUSINESS_MUTATION } from "@/lib/graphql/mutations/invoice.mutations";
import { useToast } from "@/app/providers/ToastProvider";
import { useRouter } from "next/navigation";

interface Business {
    _id?: string;
    companyName: string | null;
    contactEmail: string | null;
    location: string | null;
    logoUrl: string | null;
    ownerId: string | null;
    phoneNumber: string | null;
    websiteUrl: string | null;
}

interface AddBusinessFormProps {
    business?: Business;
}

const BusinessSchema = Yup.object().shape({
    companyName: Yup.string().required("Company name is required"),
    contactEmail: Yup.string().email("Invalid email").required("Contact email is required"),
    location: Yup.string().required("Location is required"),
    logoUrl: Yup.string().url("Must be a valid URL"),
    ownerId: Yup.string().required("Owner ID is required"),
    phoneNumber: Yup.string().required("Phone number is required"),
    websiteUrl: Yup.string().url("Must be a valid URL").nullable(),
});

const AddBusinessForm: React.FC<AddBusinessFormProps> = ({ business }) => {

    const toast = useToast();
    const router = useRouter()

    const [userId] = useState(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("user");
            if (stored) {
                const parsed = JSON.parse(stored);
                return parsed?.userId || "";
            }
        }
        return "";
    });

    const mode = business ? "edit" : "add";

    const initialValues: Business =
        business ?? {
            companyName: "",
            contactEmail: "",
            location: "",
            logoUrl: "",
            ownerId: userId,
            phoneNumber: "",
            websiteUrl: "",
        };

    const [createBusiness, { loading }] = useMutation(CREATE_BUSINESS_MUTATION);
    const [updateBusiness] = useMutation(UPDATE_BUSINESS_MUTATION);


    const sanitizeBusinessInput = (values: Business) => ({
        companyName: values.companyName ?? "",
        contactEmail: values.contactEmail ?? "",
        location: values.location ?? "",
        logoUrl: values.logoUrl ?? "",
        ownerId: values.ownerId ?? "",
        phoneNumber: values.phoneNumber ?? "",
        websiteUrl: values.websiteUrl ?? "",
    });

    const handleSubmit = async (values: Business) => {
        if (mode === "add") {
            await createBusiness({
                variables: {
                    createBusinessInput: {
                        ...values,
                        ownerId: userId,
                    },
                },
            });

            toast?.success("Business created successfully!");
            router.push("/my-business");
            return;
        }

        // edit mode
        await updateBusiness({
            variables: {
                id: business!._id,
                updateBusinessInput: sanitizeBusinessInput(values),
            },
        });

        toast?.success("Business updated successfully!");
        router.push("/my-business");
    };


    return (
        <div className="w-full bg-white shadow-lg border border-gray-100 rounded-xl p-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                {mode === "add" ? "Create New Business" : "Edit Business"}
            </h2>

            <Formik
                initialValues={initialValues}
                enableReinitialize
                validationSchema={BusinessSchema}
                onSubmit={handleSubmit}
            >
                {({ values, handleChange, setFieldValue, errors, touched }) => (
                    <Form>

                        {/* Hidden Owner ID */}
                        <input type="hidden" name="ownerId" value={userId} />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Company Name */}
                            <div className="flex flex-col gap-1">
                                <label className="font-medium">Company Name</label>
                                <Input name="companyName" value={values.companyName ?? ""} onChange={handleChange} />

                                {errors.companyName && touched.companyName && (
                                    <p className="text-red-500 text-sm">{errors.companyName}</p>
                                )}
                            </div>

                            {/* Contact Email */}
                            <div className="flex flex-col gap-1">
                                <label className="font-medium">Contact Email</label>
                                <Input name="contactEmail" value={values.contactEmail ?? ""} onChange={handleChange} />
                                {errors.contactEmail && touched.contactEmail && (
                                    <p className="text-red-500 text-sm">{errors.contactEmail}</p>
                                )}
                            </div>

                            {/* Location */}
                            <div className="flex flex-col gap-1">
                                <label className="font-medium">Location</label>
                                <Input name="location" value={values.location ?? ""} onChange={handleChange} />
                                {errors.location && touched.location && (
                                    <p className="text-red-500 text-sm">{errors.location}</p>
                                )}
                            </div>

                            {/* 🔥 Logo Upload */}
                            <div className="flex flex-col gap-2">
                                <label className="font-medium">Business Logo</label>

                                <Upload
                                    maxCount={1}
                                    accept="image/*"
                                    showUploadList={false}
                                    customRequest={async (options) => {
                                        try {
                                            const url = await uploadLogo(options);
                                            setFieldValue("logoUrl", url);
                                        } catch {
                                            message.error("Upload failed");
                                        }
                                    }}
                                >
                                    <Button className="flex items-center gap-2" icon={<FiUpload size={18} />}>
                                        Upload Logo
                                    </Button>
                                </Upload>

                                {values.logoUrl && (
                                    <div className="flex items-center gap-4 mt-3 p-3 rounded-lg bg-gray-50">
                                        <div className="flex items-center justify-center h-20 w-20 rounded-lg overflow-hidden border">
                                            <Image
                                                src={values.logoUrl}
                                                alt="Logo Preview"
                                                height={80}
                                                width={80}
                                                className="object-cover"
                                            />
                                        </div>

                                        <Button
                                            danger
                                            className="flex items-center gap-2"
                                            onClick={() => setFieldValue("logoUrl", "")}
                                        >
                                            <FiTrash size={18} /> Remove
                                        </Button>
                                    </div>
                                )}

                                {errors.logoUrl && touched.logoUrl && (
                                    <p className="text-red-500 text-sm">{errors.logoUrl}</p>
                                )}
                            </div>

                            {/* Phone Number */}
                            <div className="flex flex-col gap-1">
                                <label className="font-medium">Phone Number</label>
                                <Input name="phoneNumber" value={values.phoneNumber ?? ""} onChange={handleChange} />
                                {errors.phoneNumber && touched.phoneNumber && (
                                    <p className="text-red-500 text-sm">{errors.phoneNumber}</p>
                                )}
                            </div>

                            {/* Website URL */}
                            <div className="flex flex-col gap-1 md:col-span-2">
                                <label className="font-medium">Website URL</label>
                                <Input name="websiteUrl" value={values.websiteUrl ?? ""} onChange={handleChange} />
                                {errors.websiteUrl && touched.websiteUrl && (
                                    <p className="text-red-500 text-sm">{errors.websiteUrl}</p>
                                )}
                            </div>
                        </div>

                        {/* Submit */}
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            className="mt-8 w-full h-11 text-lg rounded-lg"
                        >
                            {mode === "add" ? "Create Business" : "Update Business"}
                        </Button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default AddBusinessForm;
