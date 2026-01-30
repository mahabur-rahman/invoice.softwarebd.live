"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { GET_MY_BUSINESSES } from "@/lib/graphql/queries";
import { UPDATE_BUSINESS_MUTATION } from "@/lib/graphql/mutations/invoice.mutations";
import { Spin } from "antd";

type BusinessSettings = {
  _id: string;
  companyName?: string | null;
  defaultBusiness?: boolean | null;
  invoiceNumberPrefix?: string | null;
  invoiceNumberPaddingDigits?: number | null;
  invoiceNumberResetYearly?: boolean | null;
  invoiceNumberStartNumber?: number | null;
};

const toNumberOrUndefined = (value: string) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
  return Math.trunc(parsed);
};

const buildPreview = (settings: {
  prefix: string;
  paddingDigits: number;
  resetYearly: boolean;
  startNumber: number;
}) => {
  const parts: string[] = [];
  const prefix = settings.prefix.trim();
  if (prefix) parts.push(prefix);
  if (settings.resetYearly) parts.push(String(new Date().getFullYear()));
  const padded = String(settings.startNumber).padStart(settings.paddingDigits, "0");
  parts.push(padded);
  return parts.join("-");
};

const InvoiceSettingsPage = () => {
  const { data, loading } = useQuery<{ myBusinesses: BusinessSettings[] }>(
    GET_MY_BUSINESSES
  );
  const [updateBusiness, { loading: saving }] = useMutation(
    UPDATE_BUSINESS_MUTATION
  );

  const businesses = data?.myBusinesses ?? [];
  const defaultBusiness =
    businesses.find((business) => business.defaultBusiness) ?? businesses[0];

  const [selectedBusinessId, setSelectedBusinessId] = useState<string>("");
  const [prefix, setPrefix] = useState("INV");
  const [paddingDigits, setPaddingDigits] = useState("6");
  const [resetYearly, setResetYearly] = useState(true);
  const [startNumber, setStartNumber] = useState("1");

  useEffect(() => {
    if (!defaultBusiness?._id || selectedBusinessId) return;
    setSelectedBusinessId(defaultBusiness._id);
  }, [defaultBusiness?._id, selectedBusinessId]);

  useEffect(() => {
    const selected = businesses.find((b) => b._id === selectedBusinessId);
    if (!selected) return;
    setPrefix(selected.invoiceNumberPrefix ?? "INV");
    setPaddingDigits(
      String(selected.invoiceNumberPaddingDigits ?? 6)
    );
    setResetYearly(selected.invoiceNumberResetYearly ?? true);
    setStartNumber(String(selected.invoiceNumberStartNumber ?? 1));
  }, [businesses, selectedBusinessId]);

  const preview = useMemo(() => {
    const padding = toNumberOrUndefined(paddingDigits) ?? 6;
    const start = toNumberOrUndefined(startNumber) ?? 1;
    return buildPreview({
      prefix,
      paddingDigits: padding,
      resetYearly,
      startNumber: start,
    });
  }, [paddingDigits, prefix, resetYearly, startNumber]);

  const handleSave = async () => {
    if (!selectedBusinessId) return;
    await updateBusiness({
      variables: {
        id: selectedBusinessId,
        updateBusinessInput: {
          invoiceNumberPrefix: prefix.trim(),
          invoiceNumberPaddingDigits: toNumberOrUndefined(paddingDigits),
          invoiceNumberResetYearly: resetYearly,
          invoiceNumberStartNumber: toNumberOrUndefined(startNumber),
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Settings
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            Invoice numbering
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Configure invoice number format per business. Numbers are reserved
            when you start a new invoice.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {loading ? (
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <Spin size="small" /> Loading businesses...
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Business
                </label>
                <select
                  value={selectedBusinessId}
                  onChange={(event) => setSelectedBusinessId(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                >
                  <option value="">Select business</option>
                  {businesses.map((business) => (
                    <option key={business._id} value={business._id}>
                      {business.companyName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Prefix
                  </label>
                  <input
                    value={prefix}
                    onChange={(event) => setPrefix(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    placeholder="INV"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Number of digits
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={paddingDigits}
                    onChange={(event) => setPaddingDigits(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Year format
                  </label>
                  <select
                    value={resetYearly ? "year" : "none"}
                    onChange={(event) =>
                      setResetYearly(event.target.value === "year")
                    }
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  >
                    <option value="year">Include year (YYYY)</option>
                    <option value="none">No year</option>
                  </select>
                  <p className="mt-1 text-xs text-slate-400">
                    When enabled, numbering resets every year.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Start number
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={startNumber}
                    onChange={(event) => setStartNumber(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                Example: <span className="font-semibold">{preview}</span>
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={!selectedBusinessId || saving}
                className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <Spin size="small" /> Saving
                  </span>
                ) : (
                  "Save settings"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceSettingsPage;
