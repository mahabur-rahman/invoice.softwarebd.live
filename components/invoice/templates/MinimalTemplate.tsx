import ClassicTemplate from "./ClassicTemplate";
import { InvoiceTemplateProps } from "./types";

const MinimalTemplate = (props: InvoiceTemplateProps) => {
  return <ClassicTemplate {...props} />;
};

export default MinimalTemplate;
