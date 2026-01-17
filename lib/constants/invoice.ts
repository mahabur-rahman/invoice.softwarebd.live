export const INVOICE_CURRENCY_OPTIONS = [
  "BDT",
  "EUR",
  "GBP",
  "INR",
  "USD",
] as const;

export const INVOICE_STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "INVOICE", label: "Invoice" },
  { value: "PROPOSAL", label: "Proposal" },
  { value: "QUOTATION", label: "Quotation" },
] as const;
