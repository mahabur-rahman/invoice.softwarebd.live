export type CountryOption = {
  name: string;
  dialCode: string;
  currency: string;
  iso2: string;
};

export const COUNTRY_OPTIONS: CountryOption[] = [
  { name: "Bangladesh", dialCode: "+880", currency: "BDT", iso2: "BD" },
  { name: "United States", dialCode: "+1", currency: "USD", iso2: "US" },
  { name: "United Kingdom", dialCode: "+44", currency: "GBP", iso2: "GB" },
  { name: "India", dialCode: "+91", currency: "INR", iso2: "IN" },
  { name: "Germany", dialCode: "+49", currency: "EUR", iso2: "DE" },
  { name: "France", dialCode: "+33", currency: "EUR", iso2: "FR" },
  { name: "Spain", dialCode: "+34", currency: "EUR", iso2: "ES" },
  { name: "Italy", dialCode: "+39", currency: "EUR", iso2: "IT" },
  { name: "Netherlands", dialCode: "+31", currency: "EUR", iso2: "NL" },
];
