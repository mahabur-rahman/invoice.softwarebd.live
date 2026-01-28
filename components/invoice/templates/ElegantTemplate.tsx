import ClassicTemplate from "./ClassicTemplate";
import { InvoiceTemplateProps } from "./types";

const ElegantTemplate = (props: InvoiceTemplateProps) => {
  return <ClassicTemplate {...props} />;
};

export default ElegantTemplate;
