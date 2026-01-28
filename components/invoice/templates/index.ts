import BusinessTemplate from "./BusinessTemplate";
import ClassicTemplate from "./ClassicTemplate";
import CleanTemplate from "./CleanTemplate";
import ElegantTemplate from "./ElegantTemplate";
import MinimalTemplate from "./MinimalTemplate";
import ModernTemplate from "./ModernTemplate";
import ProfessionalTemplate from "./ProfessionalTemplate";
import SimpleTemplate from "./SimpleTemplate";
import SmartTemplate from "./SmartTemplate";
import StandardTemplate from "./StandardTemplate";
import { InvoiceTemplateKey, InvoiceTemplateProps } from "./types";
import type { ComponentType } from "react";

export const INVOICE_TEMPLATE_OPTIONS: {
  key: InvoiceTemplateKey;
  label: string;
}[] = [
  { key: "BUSINESS", label: "Business" },
  { key: "CLASSIC", label: "Classic" },
  { key: "CLEAN", label: "Clean" },
  { key: "ELEGANT", label: "Elegant" },
  { key: "MINIMAL", label: "Minimal" },
  { key: "MODERN", label: "Modern" },
  { key: "PROFESSIONAL", label: "Professional" },
  { key: "SIMPLE", label: "Simple" },
  { key: "SMART", label: "Smart" },
  { key: "STANDARD", label: "Standard" },
];

export const TEMPLATE_COMPONENTS: Record<
  InvoiceTemplateKey,
  ComponentType<InvoiceTemplateProps>
> = {
  BUSINESS: BusinessTemplate,
  CLASSIC: ClassicTemplate,
  CLEAN: CleanTemplate,
  ELEGANT: ElegantTemplate,
  MINIMAL: MinimalTemplate,
  MODERN: ModernTemplate,
  PROFESSIONAL: ProfessionalTemplate,
  SIMPLE: SimpleTemplate,
  SMART: SmartTemplate,
  STANDARD: StandardTemplate,
};

export type { InvoiceTemplateKey, InvoiceTemplateProps } from "./types";
