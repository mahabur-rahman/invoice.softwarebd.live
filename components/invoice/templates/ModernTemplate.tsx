import ClassicTemplate from "./ClassicTemplate";
import { InvoiceTemplateProps } from "./types";

const ModernTemplate = (props: InvoiceTemplateProps) => {
  return <ClassicTemplate {...props} />;
};

export default ModernTemplate;
