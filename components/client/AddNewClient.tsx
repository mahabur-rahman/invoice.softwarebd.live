"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, useFormikContext } from "formik";
import * as Yup from "yup";
import { Button, Input, Select } from "antd";
import { FiMail, FiMapPin, FiUser } from "react-icons/fi";
import { useQuery, useMutation } from "@apollo/client/react";

import { ClientType } from "@/lib/graphql/generated-types";
import {
  CREATE_CLIENT,
  UPDATE_CLIENT,
} from "@/lib/graphql/mutations/invoice.mutations";
import {
  GET_ALL_CLIENTS,
  GET_MY_BUSINESSES_ID,
} from "@/lib/graphql/queries/invoice.queries";
import { useUserStore } from "@/lib/store/userStore";
import { BusinessQueryResponse } from "@/lib/interfaces/responseTypes";
import { COUNTRY_OPTIONS } from "@/lib/constants/countries";

const ClientSchema = Yup.object().shape({
  name: Yup.string().required("Client name is required"),
  clientCompanyName: Yup.string().required("Company name is required"),
  address: Yup.string().required("Address is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  country: Yup.string().required("Country is required"),
  countryCode: Yup.string().required("Country code is required"),
  phone: Yup.string().required("Phone number is required"),
  businessId: Yup.string().required("Business ID is required"),
});

interface AddNewClientProps {
  client?: (ClientType & { country?: string | null; countryCode?: string | null }) | null;
  onSuccess?: (clientId?: string) => void;
  redirectOnSuccess?: boolean;
  variant?: "page" | "modal";
}

type ClientFormValues = {
  id?: string;
  name: string;
  clientCompanyName: string;
  address: string;
  email: string;
  country?: string;
  countryCode?: string;
  phone: string;
  businessId: string;
  userId: string;
};

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
      address: city ? `${city}, ${match.name}` : match.name,
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
  autoDetect: { country: string; countryCode: string; address?: string } | null;
}) => {
  const { values, setFieldValue } = useFormikContext<ClientFormValues>();

  useEffect(() => {
    if (!enabled || !autoDetect) return;
    if (!values.country) {
      setFieldValue("country", autoDetect.country, false);
    }
    if (!values.countryCode) {
      setFieldValue("countryCode", autoDetect.countryCode, false);
    }
    if (!values.address && autoDetect.address) {
      setFieldValue("address", autoDetect.address, false);
    }
  }, [
    autoDetect,
    enabled,
    setFieldValue,
    values.country,
    values.countryCode,
    values.address,
  ]);

  return null;
};

const AddNewClient: React.FC<AddNewClientProps> = ({
  client,
  onSuccess,
  redirectOnSuccess = true,
  variant = "page",
}) => {
  const router = useRouter();
  const userId = useUserStore((state) => state.userId);
  const isModal = variant === "modal";

  const { data: businessList, loading: bizLoading } =
    useQuery<BusinessQueryResponse>(GET_MY_BUSINESSES_ID);

  const [createClient] = useMutation(CREATE_CLIENT, {
    refetchQueries: [{ query: GET_ALL_CLIENTS }],
    awaitRefetchQueries: true,
  });
  const [updateClient] = useMutation(UPDATE_CLIENT);

  const [autoDetect, setAutoDetect] = useState<{
    country: string;
    countryCode: string;
    address?: string;
  } | null>(null);

  useEffect(() => {
    if (client) return;
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
  }, [client]);

  const initialValues: ClientFormValues = client
    ? {
        id: client?._id || "",
        name: client?.name || "",
        clientCompanyName: client?.clientCompanyName || "",
        address: client?.address || "",
        email: client?.email || "",
        country: client?.country ?? "",
        countryCode: client?.countryCode ?? "",
        phone: client?.phone || "",
        businessId: client?.businessId || "",
        userId: client?.userId || "",
      }
    : {
        name: "",
        clientCompanyName: "",
        address: "",
        email: "",
        country: "",
        countryCode: "",
        phone: "",
        businessId: "",
        userId: userId || "",
      };

  const handleSubmit = async (values: ClientFormValues) => {
    try {
      if (client) {
        const { data: updated } = await updateClient({
          variables: {
            input: {
              id: client._id,
              ...values,
            },
          },
        });
        if (!redirectOnSuccess) {
          onSuccess?.((updated as any)?.updateClient?._id);
        }
      } else {
        const { data: created } = await createClient({
          variables: { input: values },
        });
        if (!redirectOnSuccess) {
          onSuccess?.((created as any)?.createClient?._id);
        }
      }

      if (redirectOnSuccess) {
        router.push("/clients");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const defaultBusinessId =
    businessList?.myBusinesses?.find((b) => b.defaultBusiness)?._id ??
    businessList?.myBusinesses?.[0]?._id;

  const DefaultBusinessSetter = ({ businessId }: { businessId?: string }) => {
    const { values, setFieldValue } = useFormikContext<ClientFormValues>();
    useEffect(() => {
      if (client) return;
      if (!businessId) return;
      if (values.businessId) return;
      setFieldValue("businessId", businessId);
    }, [businessId, values.businessId, setFieldValue]);
    return null;
  };

  const businessOptions = useMemo(
    () =>
      (businessList?.myBusinesses ?? []).map((business) => ({
        label: business.companyName ?? "Untitled business",
        value: business._id,
      })),
    [businessList?.myBusinesses]
  );

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
                <FiUser /> Client setup
              </span>
              <div>
                <h2 className="text-3xl font-semibold text-slate-900">
                  {client ? "Update client profile" : "Add a new client"}
                </h2>
                <p className="mt-3 text-sm text-slate-600">
                  Save client details once so every invoice stays accurate and
                  professional.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-800">
                  Helpful tips
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li>Add the company name clients recognize.</li>
                  <li>Include a verified email for invoice delivery.</li>
                  <li>Store the correct country code for quick contact.</li>
                </ul>
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.12)] md:p-8">
            <Formik
              enableReinitialize
              initialValues={initialValues}
              validationSchema={ClientSchema}
              onSubmit={handleSubmit}
            >
              {({ values, handleChange, errors, touched, isSubmitting, setFieldValue }) => (
                <Form>
                  <AutoLocationFromDetect enabled={!client} autoDetect={autoDetect} />
                  <DefaultBusinessSetter businessId={defaultBusinessId} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Client Name
                      </label>
                      <Input
                        size="large"
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        placeholder="John Smith"
                      />
                      {errors.name && touched.name && (
                        <p className="text-red-500 text-sm">{errors.name}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Company Name
                      </label>
                      <Input
                        size="large"
                        name="clientCompanyName"
                        value={values.clientCompanyName}
                        onChange={handleChange}
                        placeholder="Brightlane Studio"
                      />
                      {errors.clientCompanyName && touched.clientCompanyName && (
                        <p className="text-red-500 text-sm">{errors.clientCompanyName}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Email
                      </label>
                      <Input
                        size="large"
                        prefix={<FiMail />}
                        name="email"
                        value={values.email}
                        onChange={handleChange}
                        placeholder="client@company.com"
                      />
                      {errors.email && touched.email && (
                        <p className="text-red-500 text-sm">{errors.email}</p>
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
                        Address
                      </label>
                      <Input
                        size="large"
                        prefix={<FiMapPin />}
                        name="address"
                        value={values.address}
                        onChange={handleChange}
                        placeholder="Dhaka, Bangladesh"
                      />
                      {errors.address && touched.address && (
                        <p className="text-red-500 text-sm">{errors.address}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Phone Number
                      </label>
                      <Input
                        size="large"
                        name="phone"
                        value={values.phone}
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
                      {errors.phone && touched.phone && (
                        <p className="text-red-500 text-sm">{errors.phone}</p>
                      )}
                      {errors.countryCode && touched.countryCode && (
                        <p className="text-red-500 text-sm">{errors.countryCode}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Business
                      </label>
                      <Select
                        size="large"
                        value={values.businessId || undefined}
                        onChange={(value) => setFieldValue("businessId", value)}
                        options={businessOptions}
                        loading={bizLoading}
                        showSearch
                        optionFilterProp="label"
                        placeholder="Select a business"
                      />
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
                    {client ? "Update Client" : "Create Client"}
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

export default AddNewClient;
