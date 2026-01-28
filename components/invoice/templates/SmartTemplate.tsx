import ClassicTemplate from "./ClassicTemplate";
import { InvoiceTemplateProps } from "./types";

const SmartTemplate = (props: InvoiceTemplateProps) => {
  return <ClassicTemplate {...props} />;
};

export default SmartTemplate;
