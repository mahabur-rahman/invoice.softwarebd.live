"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Formik, Form, useFormikContext } from "formik";
import * as Yup from "yup";
import { Input, Button, Select, Upload, message } from "antd";
import Image from "next/image";
import {
  FiBriefcase,
  FiGlobe,
  FiMail,
  FiMapPin,
  FiTrash,
  FiUpload,
} from "react-icons/fi";
import { useMutation } from "@apollo/client/react";
import {
  CREATE_BUSINESS_MUTATION,
  UPDATE_BUSINESS_MUTATION,
} from "@/lib/graphql/mutations/invoice.mutations";
import { useToast } from "@/app/providers/ToastProvider";
import { useRouter } from "next/navigation";
import { uploadLogo } from "@/utils/uploadLogo";
import { GET_MY_BUSINESSES } from "@/lib/graphql/queries";
import { COUNTRY_OPTIONS } from "@/lib/constants/countries";

interface Business {
  _id?: string;
  companyName: string | null;
  contactEmail: string | null;
  country?: string | null;
  countryCode?: string | null;
  location: string | null;
  logoUrl: string | null;
  ownerId: string | null;
  phoneNumber: string | null;
  websiteUrl: string | null;
  defaultBusiness?: boolean | null;
}

interface AddBusinessFormProps {
  business?: Business;
  onSuccess?: () => void;
  redirectOnSuccess?: boolean;
  variant?: "page" | "modal";
}

const BusinessSchema = Yup.object().shape({
  companyName: Yup.string().required("Company name is required"),
  contactEmail: Yup.string()
    .email("Invalid email")
    .required("Contact email is required"),
  country: Yup.string().required("Country is required"),
  countryCode: Yup.string().required("Country code is required"),
  location: Yup.string().required("Location is required"),
  logoUrl: Yup.string().url("Must be a valid URL"),
  ownerId: Yup.string().required("Owner ID is required"),
  phoneNumber: Yup.string().required("Phone number is required"),
  websiteUrl: Yup.string().url("Must be a valid URL").nullable(),
  defaultBusiness: Yup.boolean().nullable(),
});

const getDefaultCountryFromLocale = () => {
  if (typeof window === "undefined") return null;
  const locale = window.navigator?.language ?? "";
  let region = "";

  try {
    const parsed = new Intl.Locale(locale);
    region = parsed.region ?? "";
  } catch {
    const parts = locale.split("-");
    if (parts.length > 1) {
      region = parts[1];
    }
  }

  if (!region) return null;
  const match = COUNTRY_OPTIONS.find(
    (country) => country.iso2.toUpperCase() === region.toUpperCase()
  );
  if (!match) return null;
  return { country: match.name, countryCode: match.dialCode };
};

const getAutoLocationFromGeolocation = async () => {
  if (typeof window === "undefined") return null;
  if (!navigator.geolocation) return null;

  const position = await new Promise<GeolocationPosition | null>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 }
    );
  });

  if (!position) return null;

  const { latitude, longitude } = position.coords;
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          Accept: "application/json",
          "Accept-Language": window.navigator?.language ?? "en",
        },
      }
    );
    if (!response.ok) return null;
    const data = await response.json();
    const countryName = data?.address?.country as string | undefined;
    const countryIso2 = data?.address?.country_code as string | undefined;
    if (!countryName && !countryIso2) return null;

    const match = COUNTRY_OPTIONS.find(
      (country) =>
        (countryIso2 &&
          country.iso2.toUpperCase() === countryIso2.toUpperCase()) ||
        (countryName &&
          country.name.toLowerCase() === countryName.toLowerCase())
    );
    if (!match) return null;

    const city =
      data?.address?.city ||
      data?.address?.town ||
      data?.address?.village ||
      data?.address?.state ||
      data?.address?.county;

    return {
      country: match.name,
      countryCode: match.dialCode,
      location: city ? `${city}, ${match.name}` : match.name,
    };
  } catch {
    return null;
  }
};

const AutoLocationFromDetect = ({
  enabled,
  autoDetect,
}: {
  enabled: boolean;
  autoDetect: { country: string; countryCode: string; location?: string } | null;
}) => {
  const { values, setFieldValue } = useFormikContext<Business>();

  useEffect(() => {
    if (!enabled || !autoDetect) return;
    if (!values.country) {
      setFieldValue("country", autoDetect.country, false);
    }
    if (!values.countryCode) {
      setFieldValue("countryCode", autoDetect.countryCode, false);
    }
    if (!values.location && autoDetect.location) {
      setFieldValue("location", autoDetect.location, false);
    }
  }, [
    autoDetect,
    enabled,
    setFieldValue,
    values.country,
    values.countryCode,
    values.location,
  ]);

  return null;
};

const AddBusinessForm: React.FC<AddBusinessFormProps> = ({
  business,
  onSuccess,
  redirectOnSuccess = true,
  variant = "page",
}) => {
  const toast = useToast();
  const router = useRouter();

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
  const isModal = variant === "modal";
  const [autoDetect, setAutoDetect] = useState<{
    country: string;
    countryCode: string;
    location?: string;
  } | null>(null);

  useEffect(() => {
    if (mode !== "add") return;
    let cancelled = false;
    const detect = async () => {
      const geo = await getAutoLocationFromGeolocation();
      if (cancelled) return;
      if (geo) {
        setAutoDetect(geo);
        return;
      }
      const localeDetected = getDefaultCountryFromLocale();
      if (localeDetected) {
        setAutoDetect(localeDetected);
      }
    };
    detect();
    return () => {
      cancelled = true;
    };
  }, [mode]);

  const initialValues: Business = business
    ? { ...business, defaultBusiness: Boolean(business.defaultBusiness) }
    : {
        companyName: "",
        contactEmail: "",
        country: "",
        countryCode: "",
        location: "",
        logoUrl: "",
        ownerId: userId,
        phoneNumber: "",
        websiteUrl: "",
        defaultBusiness: false,
      };

  const [createBusiness, { loading }] = useMutation(CREATE_BUSINESS_MUTATION, {
    refetchQueries: [{ query: GET_MY_BUSINESSES }],
    awaitRefetchQueries: true,
  });
  const [updateBusiness] = useMutation(UPDATE_BUSINESS_MUTATION);

  const sanitizeBusinessInput = (values: Business) => ({
    companyName: values.companyName ?? "",
    contactEmail: values.contactEmail ?? "",
    country: values.country ?? "",
    countryCode: values.countryCode ?? "",
    location: values.location ?? "",
    logoUrl: values.logoUrl ?? "",
    ownerId: values.ownerId ?? "",
    phoneNumber: values.phoneNumber ?? "",
    websiteUrl: values.websiteUrl ?? "",
    defaultBusiness: Boolean(values.defaultBusiness),
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
      if (redirectOnSuccess) {
        router.push("/my-business");
      } else {
        onSuccess?.();
      }
      return;
    }

    await updateBusiness({
      variables: {
        id: business!._id,
        updateBusinessInput: sanitizeBusinessInput(values),
      },
    });

    toast?.success("Business updated successfully!");
    if (redirectOnSuccess) {
      router.push("/my-business");
    } else {
      onSuccess?.();
    }
  };

  const isValidImageSrc = (src: string | null | undefined) => {
    if (!src) return false;
    if (src.startsWith("/") || src.startsWith("data:") || src.startsWith("blob:")) {
      return true;
    }
    try {
      new URL(src);
      return true;
    } catch {
      return false;
    }
  };

  const countryOptions = useMemo(
    () =>
      COUNTRY_OPTIONS.map((country) => ({
        label: country.name,
        value: country.name,
      })),
    []
  );

  const dialCodeOptions = useMemo(
    () =>
      COUNTRY_OPTIONS.map((country) => ({
        label: `${country.dialCode} (${country.name})`,
        value: country.dialCode,
      })),
    []
  );

  return (
    <div className="w-full">
      <div
        className={`rounded-3xl border border-slate-100 ${
          isModal
            ? "bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.12)]"
            : "bg-linear-to-br from-slate-50 via-white to-slate-100 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:p-10"
        }`}
      >
        <div
          className={`grid gap-8 ${
            isModal ? "" : "lg:grid-cols-[0.9fr_1.1fr] lg:items-start"
          }`}
        >
          {!isModal && (
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                <FiBriefcase /> Business setup
              </span>
              <div>
                <h2 className="text-3xl font-semibold text-slate-900">
                  {mode === "add"
                    ? "Create your business profile"
                    : "Update business details"}
                </h2>
                <p className="mt-3 text-sm text-slate-600">
                  Keep your invoices consistent by saving the brand, contact,
                  and payment details once.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-800">
                  Tips for a polished invoice
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li>Use a clear business name your clients recognize.</li>
                  <li>Add a logo for instant brand trust.</li>
                  <li>Double-check contact email and phone number.</li>
                  <li>Set a default business to speed up invoicing.</li>
                </ul>
              </div>
            </div>
          )}

          <div
            className={`rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.12)] md:p-8 ${
              isModal ? "w-full" : ""
            }`}
          >
            <Formik
              initialValues={initialValues}
              enableReinitialize
              validationSchema={BusinessSchema}
              onSubmit={handleSubmit}
            >
              {({ values, handleChange, setFieldValue, errors, touched }) => (
                <Form>
                  <AutoLocationFromDetect
                    enabled={mode === "add"}
                    autoDetect={autoDetect}
                  />
                  <input type="hidden" name="ownerId" value={userId} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Company Name
                      </label>
                      <Input
                        size="large"
                        name="companyName"
                        value={values.companyName ?? ""}
                        onChange={handleChange}
                        placeholder="Brightlane Studio"
                      />

                      {errors.companyName && touched.companyName && (
                        <p className="text-red-500 text-sm">{errors.companyName}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Contact Email
                      </label>
                      <Input
                        size="large"
                        prefix={<FiMail />}
                        name="contactEmail"
                        value={values.contactEmail ?? ""}
                        onChange={handleChange}
                        placeholder="billing@brightlane.co"
                      />
                      {errors.contactEmail && touched.contactEmail && (
                        <p className="text-red-500 text-sm">{errors.contactEmail}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Country
                      </label>
                      <Select
                        size="large"
                        value={values.country || undefined}
                        onChange={(value) => {
                          setFieldValue("country", value);
                          const next = COUNTRY_OPTIONS.find(
                            (country) => country.name === value
                          );
                          if (next?.dialCode) {
                            setFieldValue("countryCode", next.dialCode);
                          }
                        }}
                        options={countryOptions}
                        showSearch
                        optionFilterProp="label"
                        placeholder="Select a country"
                      />
                      {errors.country && touched.country && (
                        <p className="text-red-500 text-sm">{errors.country}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Location
                      </label>
                      <Input
                        size="large"
                        prefix={<FiMapPin />}
                        name="location"
                        value={values.location ?? ""}
                        onChange={handleChange}
                        placeholder="Dhaka, Bangladesh"
                      />
                      {errors.location && touched.location && (
                        <p className="text-red-500 text-sm">{errors.location}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Phone Number
                      </label>
                      <Input
                        size="large"
                        name="phoneNumber"
                        value={values.phoneNumber ?? ""}
                        onChange={handleChange}
                        placeholder="17 0000 0000"
                        addonBefore={
                          <Select
                            value={values.countryCode || undefined}
                            options={dialCodeOptions}
                            onChange={(value) => setFieldValue("countryCode", value)}
                            showSearch
                            optionFilterProp="label"
                            optionLabelProp="value"
                            placeholder="+000"
                            className="min-w-[88px] text-xs [&_.ant-select-selector]:h-9 [&_.ant-select-selector]:py-0 [&_.ant-select-selection-item]:text-xs [&_.ant-select-selection-item]:leading-9"
                          />
                        }
                      />
                      {errors.phoneNumber && touched.phoneNumber && (
                        <p className="text-red-500 text-sm">{errors.phoneNumber}</p>
                      )}
                      {errors.countryCode && touched.countryCode && (
                        <p className="text-red-500 text-sm">{errors.countryCode}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-3">
                      <div>
                        <label className="text-sm font-semibold text-slate-700">
                          Business Logo
                        </label>
                        <p className="text-xs text-slate-500">
                          Upload a PNG or SVG (recommended 512x512).
                        </p>
                      </div>

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
                        <Button
                          className="flex w-full items-center justify-center gap-2"
                          icon={<FiUpload size={18} />}
                        >
                          Upload Logo
                        </Button>
                      </Upload>

                      {values.logoUrl && (
                        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                          <div className="flex items-center justify-center h-20 w-20 rounded-xl overflow-hidden border border-slate-200 bg-white">
                            {isValidImageSrc(values.logoUrl) ? (
                              <Image
                                src={values.logoUrl}
                                alt="Logo Preview"
                                height={80}
                                width={80}
                                className="object-cover"
                              />
                            ) : (
                              <div className="text-xs text-gray-500 px-2 text-center">
                                Invalid logo URL
                              </div>
                            )}
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

                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Website URL
                      </label>
                      <Input
                        size="large"
                        prefix={<FiGlobe />}
                        name="websiteUrl"
                        value={values.websiteUrl ?? ""}
                        onChange={handleChange}
                        placeholder="https://brightlane.co"
                      />
                      {errors.websiteUrl && touched.websiteUrl && (
                        <p className="text-red-500 text-sm">{errors.websiteUrl}</p>
                      )}
                    </div>

                    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
                      <input
                        id="defaultBusiness"
                        name="defaultBusiness"
                        type="checkbox"
                        checked={Boolean(values.defaultBusiness)}
                        onChange={(event) =>
                          setFieldValue("defaultBusiness", event.target.checked)
                        }
                        className="mt-1 h-4 w-4 rounded border-gray-300"
                      />
                      <div>
                        <label
                          htmlFor="defaultBusiness"
                          className="font-semibold text-slate-700"
                        >
                          Set as default business
                        </label>
                        <p className="text-sm text-slate-500">
                          This business will be selected by default when creating
                          invoices.
                        </p>
                      </div>
                    </div>
                  </div>

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
        </div>
      </div>
    </div>
  );
};

export default AddBusinessForm;
