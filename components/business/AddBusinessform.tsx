"use client";

import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Input, Button, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { uploadLogo } from "@/utils/uploadLogo";
import Image from "next/image";

interface Business {
    companyName: string;
    contactEmail: string;
    location: string;
    logoUrl: string;
    ownerId: string;
    phoneNumber: string;
    websiteUrl: string;
}

interface AddBusinessFormProps {
    business?: Business; // editing mode
    onSubmit: (values: Business) => void;
}

const BusinessSchema = Yup.object().shape({
    companyName: Yup.string().required("Company name is required"),
    contactEmail: Yup.string()
        .email("Invalid email")
        .required("Contact email is required"),
    location: Yup.string().required("Location is required"),
    logoUrl: Yup.string().url("Must be a valid URL"),
    ownerId: Yup.string().required("Owner ID is required"),
    phoneNumber: Yup.string().required("Phone number is required"),
    websiteUrl: Yup.string().url("Must be a valid URL"),
});

const AddBusinessForm: React.FC<AddBusinessFormProps> = ({
    business,
    onSubmit,
}) => {
    const mode = business ? "edit" : "add";

    const initialValues: Business =
        business ?? {
            companyName: "",
            contactEmail: "",
            location: "",
            logoUrl: "",
            ownerId: "",
            phoneNumber: "",
            websiteUrl: "",
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
                onSubmit={(values) => onSubmit(values)}
            >
                {({
                    values,
                    handleChange,
                    setFieldValue,
                    errors,
                    touched,
                    isSubmitting,
                }) => (
                    <Form>
                        {/* GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Company Name */}
                            <div className="flex flex-col gap-1">
                                <label className="font-medium">Company Name</label>
                                <Input name="companyName" value={values.companyName} onChange={handleChange} />
                                {errors.companyName && touched.companyName && (
                                    <p className="text-red-500 text-sm">{errors.companyName}</p>
                                )}
                            </div>

                            {/* Contact Email */}
                            <div className="flex flex-col gap-1">
                                <label className="font-medium">Contact Email</label>
                                <Input name="contactEmail" value={values.contactEmail} onChange={handleChange} />
                                {errors.contactEmail && touched.contactEmail && (
                                    <p className="text-red-500 text-sm">{errors.contactEmail}</p>
                                )}
                            </div>

                            {/* Location */}
                            <div className="flex flex-col gap-1">
                                <label className="font-medium">Location</label>
                                <Input name="location" value={values.location} onChange={handleChange} />
                                {errors.location && touched.location && (
                                    <p className="text-red-500 text-sm">{errors.location}</p>
                                )}
                            </div>

                            {/* 🔥 Logo Upload */}
                            <div className="flex flex-col gap-1">
                                <label className="font-medium">Business Logo</label>

                                <Upload
                                    maxCount={1}
                                    accept="image/*"
                                    customRequest={async (options) => {
                                        try {
                                            const url = await uploadLogo(options);
                                            setFieldValue("logoUrl", url);
                                        } catch (err) {
                                            message.error("Upload failed");
                                            console.error(err);
                                        }
                                    }}
                                >
                                    <Button icon={<UploadOutlined />}>Upload Logo</Button>
                                </Upload>

                                {values.logoUrl && (
                                    <Image
                                        src={values.logoUrl}
                                        alt="Logo Preview"
                                        height={50}
                                        width={50}
                                        className="w-24 h-24 mt-3 object-cover rounded-lg border"
                                    />
                                )}

                                {errors.logoUrl && touched.logoUrl && (
                                    <p className="text-red-500 text-sm">{errors.logoUrl}</p>
                                )}
                            </div>

                            {/* Owner ID */}
                            <div className="flex flex-col gap-1">
                                <label className="font-medium">Owner ID</label>
                                <Input name="ownerId" value={values.ownerId} onChange={handleChange} />
                                {errors.ownerId && touched.ownerId && (
                                    <p className="text-red-500 text-sm">{errors.ownerId}</p>
                                )}
                            </div>

                            {/* Phone Number */}
                            <div className="flex flex-col gap-1">
                                <label className="font-medium">Phone Number</label>
                                <Input name="phoneNumber" value={values.phoneNumber} onChange={handleChange} />
                                {errors.phoneNumber && touched.phoneNumber && (
                                    <p className="text-red-500 text-sm">{errors.phoneNumber}</p>
                                )}
                            </div>

                            {/* Website URL */}
                            <div className="flex flex-col gap-1 md:col-span-2">
                                <label className="font-medium">Website URL</label>
                                <Input name="websiteUrl" value={values.websiteUrl} onChange={handleChange} />
                                {errors.websiteUrl && touched.websiteUrl && (
                                    <p className="text-red-500 text-sm">{errors.websiteUrl}</p>
                                )}
                            </div>
                        </div>

                        {/* Submit */}
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={isSubmitting}
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
