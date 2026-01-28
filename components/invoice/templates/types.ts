import { InvoiceColumnInput } from "@/app/(dashboard)/(invoice)/generate-invoice/page";
import { BusinessType, ClientType } from "@/lib/graphql/generated-types";

export type InvoiceTemplateKey =
  | "BUSINESS"
  | "CLASSIC"
  | "CLEAN"
  | "ELEGANT"
  | "MINIMAL"
  | "MODERN"
  | "PROFESSIONAL"
  | "SIMPLE"
  | "SMART"
  | "STANDARD";

export interface InvoiceData {
  client: string;
  business: string;
  currency: string;
  status: string;
  issueDate: string;
  dueDate: string;
  items: Record<string, string | number>[];
  notes: string;
  subtotal: number;
  total: number;
  template?: InvoiceTemplateKey;
  totalsCustom?: {
    key: string;
    label: string;
    behavior: "ADD" | "SUBTRACT" | "NONE";
    valueType: "FIXED" | "PERCENT";
    value: number;
  }[];
}

export type InvoiceTemplateProps = {
  data: InvoiceData;
  columns: InvoiceColumnInput[];
  business?: BusinessType | null;
  client?: ClientType | null;
  formatDate: (value?: string) => string;
  getValidImageUrl: (value?: string | null) => string | null;
};
